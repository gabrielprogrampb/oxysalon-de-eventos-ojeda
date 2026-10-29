-- =============================================================================
-- 0002 — MANTENIMIENTO DE LA BASE DE DATOS
-- =============================================================================
-- Ejecutar DESPUÉS de 0001_init.sql. Es idempotente.
--
-- Qué hace:
--   1. Índice para el control anti-spam del formulario (email + fecha).
--   2. Función purge_old_data(): limpia visitas antiguas y solicitudes cerradas.
--   3. Tarea programada diaria con pg_cron (si la extensión está disponible).
--   4. Función db_health(): un vistazo al tamaño y filas de cada tabla.
--
-- Política de retención por defecto:
--   · page_views   → 90 días   (métrica de tráfico, no es dato de negocio)
--   · inquiries    → 3 años    (solo las cerradas y sin valor económico)
--
-- NUNCA se borran: solicitudes reservadas, con valor cotizado, ni notas.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Índice para el límite de 3 solicitudes/hora por correo
-- -----------------------------------------------------------------------------
create index if not exists inquiries_email_created_idx
  on public.inquiries (email, created_at desc);

-- -----------------------------------------------------------------------------
-- 2. Limpieza de datos antiguos
-- -----------------------------------------------------------------------------
create or replace function public.purge_old_data(
  p_views_days     integer default 90,
  p_inquiries_days integer default 1095
)
returns table (visitas_borradas bigint, solicitudes_borradas bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_views bigint := 0;
  v_inq   bigint := 0;
begin
  if p_views_days < 7 then
    raise exception 'p_views_days debe ser >= 7 (protección contra borrados accidentales)';
  end if;
  if p_inquiries_days < 90 then
    raise exception 'p_inquiries_days debe ser >= 90';
  end if;

  delete from public.page_views
   where created_at < now() - make_interval(days => p_views_days);
  get diagnostics v_views = row_count;

  -- Solo solicitudes cerradas y sin valor: el historial comercial se conserva
  delete from public.inquiries
   where created_at < now() - make_interval(days => p_inquiries_days)
     and status in ('new', 'contacted', 'lost')
     and coalesce(value, 0) = 0;
  get diagnostics v_inq = row_count;

  return query select v_views, v_inq;
end;
$$;

-- Solo el propietario (SQL editor) y service_role pueden ejecutarla
revoke all on function public.purge_old_data(integer, integer) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Tarea programada diaria (04:15 UTC = 00:15 hora de Venezuela)
-- -----------------------------------------------------------------------------
do $do$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;

    if exists (select 1 from cron.job where jobname = 'oxy-purge-old-data') then
      perform cron.unschedule('oxy-purge-old-data');
    end if;

    perform cron.schedule(
      'oxy-purge-old-data',
      '15 4 * * *',
      $cron$select public.purge_old_data(90, 1095);$cron$
    );

    raise notice 'pg_cron programado: limpieza diaria a las 04:15 UTC';
  else
    raise notice 'pg_cron no disponible: ejecutar purge_old_data() manualmente cada mes';
  end if;
exception
  when others then
    raise notice 'No se pudo programar pg_cron (%): usar limpieza manual', sqlerrm;
end;
$do$;

-- -----------------------------------------------------------------------------
-- 4. Salud de la base de datos (para revisar desde el SQL Editor)
--    Uso:  select * from public.db_health();
-- -----------------------------------------------------------------------------
create or replace function public.db_health()
returns table (tabla text, filas_aprox bigint, tamano text, ultimo_vacuum timestamptz)
language sql
security definer
set search_path = public
as $$
  select
    c.relname::text,
    coalesce(s.n_live_tup, 0)::bigint,
    pg_size_pretty(pg_total_relation_size(c.oid)),
    s.last_autovacuum
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_stat_user_tables s on s.relid = c.oid
  where n.nspname = 'public'
    and c.relkind = 'r'
  order by pg_total_relation_size(c.oid) desc;
$$;

revoke all on function public.db_health() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. Consumo de Storage (el plan gratuito da 1 GB)
--    Uso:  select * from public.storage_usage();
-- -----------------------------------------------------------------------------
create or replace function public.storage_usage()
returns table (archivos bigint, bytes_usados bigint, legible text, porcentaje_de_1gb numeric)
language sql
security definer
set search_path = public, storage
as $$
  with t as (
    select
      count(*)::bigint as n,
      coalesce(sum((metadata->>'size')::bigint), 0)::bigint as b
    from storage.objects
    where bucket_id = 'gallery'
  )
  select
    t.n,
    t.b,
    pg_size_pretty(t.b),
    round((t.b::numeric / (1024::numeric * 1024 * 1024)) * 100, 2)
  from t;
$$;

revoke all on function public.storage_usage() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. Estadísticas al día tras la limpieza
-- -----------------------------------------------------------------------------
-- (autovacuum se encarga solo, pero forzar un analyze no hace daño)
analyze public.inquiries;
analyze public.page_views;

-- =============================================================================
-- LISTO.
-- Comprobaciones útiles desde el SQL Editor:
--   select * from public.db_health();
--   select * from public.storage_usage();
--   select pg_size_pretty(pg_database_size(current_database())) as base_completa;
--   select count(*) from public.inquiries;
--   select count(*) from public.page_views;
--   select * from cron.job;
-- =============================================================================
