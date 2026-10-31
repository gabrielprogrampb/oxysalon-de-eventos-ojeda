-- =============================================================================
-- 0003 — CONSOLA ADMINISTRATIVA: auditoría, métricas y endurecimiento
-- =============================================================================
-- Ejecutar DESPUÉS de 0001 y 0002. Es idempotente.
--
-- Qué agrega:
--   1. Roles en `admins` (owner / admin / viewer).
--   2. `updated_at` en todas las tablas editables.
--   3. `audit_logs` + triggers: toda alta/baja/cambio queda registrada con
--      autor, fecha y diferencias. Nadie puede escribir en el log desde el
--      cliente (solo los triggers SECURITY DEFINER).
--   4. Métricas honestas: `track_page_view()` deduplica por sesión y hora,
--      y `analytics_summary()` agrega en el servidor (el navegador nunca
--      descarga la tabla completa).
--   5. "Me gusta" sin inflación: un voto por sesión e imagen.
--   6. `admin_health()`: tamaño de base, filas y consumo de Storage.
--
-- Por qué importa: sin esto el panel no puede responder "quién cambió qué"
-- ni calcular métricas sin traer miles de filas al navegador.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Roles de administración
-- -----------------------------------------------------------------------------
alter table public.admins
  add column if not exists role text not null default 'admin';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admins_role_check'
  ) then
    alter table public.admins
      add constraint admins_role_check check (role in ('owner', 'admin', 'viewer'));
  end if;
end $$;

alter table public.admins
  add column if not exists last_seen_at timestamptz;

-- El primer administrador registrado queda como propietario
update public.admins a
   set role = 'owner'
 where a.role = 'admin'
   and a.created_at = (select min(created_at) from public.admins);

create or replace function public.admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.admins where user_id = auth.uid()), 'none');
$$;

revoke all on function public.admin_role() from public, anon;
grant execute on function public.admin_role() to authenticated;

-- El panel necesita listar al equipo; antes solo se veía a sí mismo.
drop policy if exists "admins_select_team" on public.admins;
create policy "admins_select_team" on public.admins
  for select to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. updated_at en las tablas editables
-- -----------------------------------------------------------------------------
alter table public.gallery_items   add column if not exists updated_at timestamptz not null default now();
alter table public.transactions    add column if not exists updated_at timestamptz not null default now();
alter table public.calendar_events add column if not exists updated_at timestamptz not null default now();

drop trigger if exists gallery_touch_updated_at on public.gallery_items;
create trigger gallery_touch_updated_at
  before update on public.gallery_items
  for each row execute function public.touch_updated_at();

drop trigger if exists transactions_touch_updated_at on public.transactions;
create trigger transactions_touch_updated_at
  before update on public.transactions
  for each row execute function public.touch_updated_at();

drop trigger if exists calendar_touch_updated_at on public.calendar_events;
create trigger calendar_touch_updated_at
  before update on public.calendar_events
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Registro de auditoría
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  actor_id    uuid,
  actor_email text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  summary     text not null,
  changes     jsonb,
  severity    text not null default 'info'
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'audit_logs_severity_check') then
    alter table public.audit_logs
      add constraint audit_logs_severity_check check (severity in ('info', 'warning', 'critical'));
  end if;
end $$;

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_entity_idx     on public.audit_logs (entity, entity_id);
create index if not exists audit_logs_severity_idx   on public.audit_logs (severity, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_admin_read" on public.audit_logs;
create policy "audit_admin_read" on public.audit_logs
  for select to authenticated
  using (public.is_admin());

-- Nadie escribe el log desde el cliente: solo los triggers (SECURITY DEFINER).
revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- Función genérica de auditoría
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old        jsonb;
  v_new        jsonb;
  v_changes    jsonb;
  v_actor      uuid;
  v_email      text;
  v_action     text;
  v_entity_id  text;
  v_summary    text;
  v_severity   text := 'info';
begin
  v_actor := auth.uid();
  v_email := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email';

  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    v_new := null;
    v_action := tg_table_name || '.deleted';
    v_severity := 'warning';
  elsif tg_op = 'INSERT' then
    v_old := null;
    v_new := to_jsonb(new);
    v_action := tg_table_name || '.created';
  else
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_action := tg_table_name || '.updated';

    -- Solo las columnas que realmente cambiaron (evita ruido en el log)
    select jsonb_object_agg(n.key, jsonb_build_object('antes', v_old -> n.key, 'despues', v_new -> n.key))
      into v_changes
      from jsonb_each(v_new) n
     where v_old -> n.key is distinct from v_new -> n.key
       and n.key not in ('updated_at');

    -- Un cambio de estado del embudo es más relevante que editar una nota
    if tg_table_name = 'inquiries' and (v_changes ? 'status') then
      v_severity := 'info';
    end if;
    if tg_table_name = 'transactions' and (v_changes ? 'amount') then
      v_severity := 'warning';
    end if;
  end if;

  v_entity_id := coalesce(v_new ->> 'id', v_old ->> 'id',
                          v_new ->> 'date', v_old ->> 'date');

  v_summary := case tg_table_name
    when 'inquiries' then
      case tg_op
        when 'INSERT' then 'Nueva solicitud de ' || coalesce(v_new ->> 'name', 'visitante')
        when 'UPDATE' then 'Solicitud de ' || coalesce(v_new ->> 'name', '—') || ' actualizada'
        else 'Solicitud eliminada'
      end
    when 'transactions' then
      case tg_op
        when 'INSERT' then 'Movimiento registrado: ' || coalesce(v_new ->> 'title', '—')
        when 'UPDATE' then 'Movimiento editado: ' || coalesce(v_new ->> 'title', '—')
        else 'Movimiento eliminado: ' || coalesce(v_old ->> 'title', '—')
      end
    when 'gallery_items' then
      case tg_op
        when 'INSERT' then 'Imagen agregada a la galería'
        when 'UPDATE' then 'Imagen de galería actualizada'
        else 'Imagen eliminada de la galería'
      end
    when 'calendar_events' then
      case tg_op
        when 'INSERT' then 'Fecha bloqueada en la agenda'
        when 'UPDATE' then 'Fecha de agenda modificada'
        else 'Fecha liberada en la agenda'
      end
    else tg_table_name || ' ' || lower(tg_op)
  end;

  -- El formulario público escribe con `anon`: se identifica como sitio web
  if v_actor is null then
    v_email := coalesce(v_email, 'sitio público');
  end if;

  insert into public.audit_logs
    (actor_id, actor_email, action, entity, entity_id, summary, changes, severity)
  values
    (v_actor, v_email, v_action, tg_table_name, v_entity_id, v_summary, v_changes, v_severity);

  return coalesce(new, old);
end;
$$;

revoke all on function public.audit_row_change() from public, anon, authenticated;

-- Triggers sobre las tablas de negocio
do $$
declare
  t text;
begin
  foreach t in array array['inquiries', 'transactions', 'gallery_items', 'calendar_events']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function public.audit_row_change()',
      t || '_audit', t
    );
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 4. Visitas: deduplicación por sesión + hora
-- -----------------------------------------------------------------------------
alter table public.page_views add column if not exists session_id text;
-- `bucket` es una columna normal (no generada): date_trunc sobre timestamptz
-- no es IMMUTABLE y PostgreSQL no la admite en columnas generadas.
alter table public.page_views
  add column if not exists bucket timestamptz not null default date_trunc('hour', now());

create unique index if not exists page_views_dedupe_idx
  on public.page_views (path, session_id, bucket);

-- El cliente ya no inserta filas sueltas: usa la función, que deduplica.
drop policy if exists "views_public_insert" on public.page_views;
revoke insert on public.page_views from anon, authenticated;

create or replace function public.track_page_view(p_path text, p_session text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Sin identificador de sesión no se registra: evita inflar la métrica
  if p_session is null or char_length(p_session) < 8 then
    return;
  end if;
  if p_path is null or char_length(btrim(p_path)) = 0 then
    return;
  end if;

  insert into public.page_views (path, session_id)
  values (left(btrim(p_path), 200), left(p_session, 64))
  on conflict (path, session_id, bucket) do nothing;
exception
  when others then
    -- Una visita perdida jamás debe romper la página del visitante
    return;
end;
$$;

revoke all on function public.track_page_view(text, text) from public;
grant execute on function public.track_page_view(text, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. "Me gusta" sin inflación: un voto por sesión e imagen
-- -----------------------------------------------------------------------------
create table if not exists public.gallery_likes (
  item_id    bigint not null references public.gallery_items (id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (item_id, session_id)
);

alter table public.gallery_likes enable row level security;
revoke all on public.gallery_likes from anon, authenticated;

drop function if exists public.like_gallery_item(bigint);

create or replace function public.like_gallery_item(p_item_id bigint, p_session text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_likes integer;
  v_rows  integer := 0;
begin
  if p_session is null or char_length(p_session) < 8 then
    select likes into v_likes from public.gallery_items where id = p_item_id;
    return coalesce(v_likes, 0);
  end if;

  insert into public.gallery_likes (item_id, session_id)
  values (p_item_id, left(p_session, 64))
  on conflict do nothing;

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    update public.gallery_items
       set likes = likes + 1
     where id = p_item_id
       and published = true;
  end if;

  select likes into v_likes from public.gallery_items where id = p_item_id;
  return coalesce(v_likes, 0);
end;
$$;

revoke all on function public.like_gallery_item(bigint, text) from public;
grant execute on function public.like_gallery_item(bigint, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. Resumen analítico (se agrega en el servidor, no en el navegador)
-- -----------------------------------------------------------------------------
create or replace function public.analytics_summary(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days   integer := greatest(7, least(coalesce(p_days, 30), 365));
  v_from   date := current_date - (v_days - 1);
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  with dias as (
    select generate_series(v_from, current_date, interval '1 day')::date as d
  ),
  visitas as (
    select created_at::date as d, count(*)::int as n
      from public.page_views
     where created_at >= v_from
     group by 1
  ),
  solicitudes as (
    select created_at::date as d,
           count(*)::int as n,
           count(*) filter (where status = 'booked')::int as reservadas
      from public.inquiries
     where created_at >= v_from
     group by 1
  ),
  dinero as (
    select date as d,
           sum(case when type = 'income'  then amount else 0 end) as ingresos,
           sum(case when type = 'expense' then amount else 0 end) as gastos
      from public.transactions
     where date >= v_from
     group by 1
  ),
  serie as (
    select dias.d,
           coalesce(visitas.n, 0)             as visitas,
           coalesce(solicitudes.n, 0)         as solicitudes,
           coalesce(solicitudes.reservadas, 0) as reservadas,
           coalesce(dinero.ingresos, 0)       as ingresos
      from dias
      left join visitas     on visitas.d = dias.d
      left join solicitudes on solicitudes.d = dias.d
      left join dinero      on dinero.d = dias.d
  )
  select jsonb_build_object(
    'days', v_days,
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
               'date', to_char(serie.d, 'YYYY-MM-DD'),
               'visits', serie.visitas,
               'inquiries', serie.solicitudes,
               'booked', serie.reservadas,
               'revenue', serie.ingresos
             ) order by serie.d)
      from serie
    ), '[]'::jsonb),
    'totals', jsonb_build_object(
      'visits',    (select coalesce(sum(visitas), 0) from serie),
      'inquiries', (select coalesce(sum(solicitudes), 0) from serie),
      'booked',    (select coalesce(sum(reservadas), 0) from serie),
      'revenue',   (select coalesce(sum(ingresos), 0) from serie)
    ),
    'allTime', jsonb_build_object(
      'inquiries', (select count(*) from public.inquiries),
      'booked',    (select count(*) from public.inquiries where status = 'booked'),
      'revenue',   (select coalesce(sum(value), 0) from public.inquiries where status = 'booked'),
      'views',     (select count(*) from public.page_views)
    ),
    'statusCounts', coalesce((
      select jsonb_object_agg(s.status, s.n)
        from (select status, count(*)::int as n from public.inquiries group by 1) s
    ), '{}'::jsonb),
    'topPaths', coalesce((
      select jsonb_agg(jsonb_build_object('path', p.path, 'views', p.n) order by p.n desc)
        from (
          select coalesce(path, '(sin ruta)') as path, count(*)::int as n
            from public.page_views
           where created_at >= v_from
           group by 1
           order by n desc
           limit 8
        ) p
    ), '[]'::jsonb),
    'pending', jsonb_build_object(
      'newInquiries', (select count(*) from public.inquiries where status = 'new'),
      'upcoming',     (select count(*) from public.calendar_events
                        where date >= current_date and status <> 'maintenance')
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.analytics_summary(integer) from public, anon;
grant execute on function public.analytics_summary(integer) to authenticated;

-- -----------------------------------------------------------------------------
-- 7. Salud del sistema para la pantalla de administración
-- -----------------------------------------------------------------------------
create or replace function public.admin_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  v_storage_bytes bigint := 0;
  v_files         bigint := 0;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  select count(*), coalesce(sum((metadata ->> 'size')::bigint), 0)
    into v_files, v_storage_bytes
    from storage.objects
   where bucket_id = 'gallery';

  return jsonb_build_object(
    'databaseBytes', pg_database_size(current_database()),
    'storageBytes',  v_storage_bytes,
    'storageFiles',  v_files,
    'counts', jsonb_build_object(
      'inquiries',    (select count(*) from public.inquiries),
      'transactions', (select count(*) from public.transactions),
      'gallery',      (select count(*) from public.gallery_items),
      'calendar',     (select count(*) from public.calendar_events),
      'pageViews',    (select count(*) from public.page_views),
      'auditLogs',    (select count(*) from public.audit_logs),
      'admins',       (select count(*) from public.admins)
    ),
    'oldestInquiry', (select min(created_at) from public.inquiries),
    'lastAuditAt',   (select max(created_at) from public.audit_logs),
    'purgeScheduled', exists (select 1 from pg_extension where extname = 'pg_cron')
  );
end;
$$;

revoke all on function public.admin_health() from public, anon;
grant execute on function public.admin_health() to authenticated;

-- -----------------------------------------------------------------------------
-- 8. Exportación de auditoría en CSV se hace en el cliente sobre la página
--    consultada (no se expone service_role en ningún momento).
-- -----------------------------------------------------------------------------
analyze public.audit_logs;
analyze public.page_views;
analyze public.inquiries;

-- =============================================================================
-- LISTO.
-- Verificación rápida:
--   select count(*) from public.audit_logs;
--   select public.analytics_summary(30);
--   select public.admin_health();
-- =============================================================================
