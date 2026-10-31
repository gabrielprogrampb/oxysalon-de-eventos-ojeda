-- =============================================================================
-- 0005 — SEDE DEL EVENTO
-- =============================================================================
-- Ejecutar DESPUÉS de 0004. Es idempotente.
--
-- Por qué: el negocio opera en tres sedes (Cabimas, Ojeda y Maracaibo) y su
-- propio WhatsApp automático pide la sede antes que cualquier otro dato. El
-- formulario no la pedía, así que el panel recibía solicitudes sin saber a qué
-- sede correspondían.
-- =============================================================================

alter table public.inquiries
  add column if not exists venue text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inquiries_venue_check') then
    alter table public.inquiries
      add constraint inquiries_venue_check
      check (venue is null or venue in ('Cabimas', 'Ojeda', 'Maracaibo'));
  end if;
end $$;

create index if not exists inquiries_venue_idx on public.inquiries (venue);

-- -----------------------------------------------------------------------------
-- submit_inquiry: se reemplaza porque cambia la firma (nuevo parámetro p_venue)
-- -----------------------------------------------------------------------------
drop function if exists public.submit_inquiry(
  text, text, text, text, text, text, date, text, text, text
);

create or replace function public.submit_inquiry(
  p_name           text,
  p_email          text,
  p_phone          text,
  p_instagram      text default null,
  p_telegram       text default null,
  p_event_type     text default null,
  p_event_date     date default null,
  p_guests_range   text default null,
  p_space_interest text default null,
  p_message        text default null,
  p_venue          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent integer;
  v_venue  text;
begin
  -- Validaciones de servidor (no confiar en el navegador)
  if p_name is null or char_length(btrim(p_name)) < 2 then
    raise exception 'invalid_name';
  end if;

  if p_email is null or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$' then
    raise exception 'invalid_email';
  end if;

  if p_phone is null or char_length(regexp_replace(p_phone, '\D', '', 'g')) < 7 then
    raise exception 'invalid_phone';
  end if;

  -- La sede se normaliza contra la lista real; cualquier otro valor se descarta
  -- en vez de rechazar la solicitud completa (el dato es útil, no obligatorio).
  v_venue := case
    when lower(btrim(coalesce(p_venue, ''))) like 'cabimas%'   then 'Cabimas'
    when lower(btrim(coalesce(p_venue, ''))) like 'maracaibo%' then 'Maracaibo'
    when lower(btrim(coalesce(p_venue, ''))) like '%ojeda%'    then 'Ojeda'
    else null
  end;

  -- Anti-spam: máximo 3 solicitudes del mismo correo por hora
  select count(*) into v_recent
    from public.inquiries
   where email = lower(btrim(p_email))
     and created_at > now() - interval '1 hour';

  if v_recent >= 3 then
    raise exception 'rate_limited';
  end if;

  insert into public.inquiries (
    name, email, phone, instagram, telegram,
    event_type, event_date, guests_range, space_interest, message,
    venue, status, source, value, notes
  ) values (
    left(btrim(p_name), 120),
    left(lower(btrim(p_email)), 160),
    left(btrim(p_phone), 40),
    nullif(left(btrim(coalesce(p_instagram, '')), 80), ''),
    nullif(left(btrim(coalesce(p_telegram, '')), 80), ''),
    nullif(left(btrim(coalesce(p_event_type, '')), 60), ''),
    p_event_date,
    nullif(left(btrim(coalesce(p_guests_range, '')), 40), ''),
    nullif(left(btrim(coalesce(p_space_interest, '')), 120), ''),
    nullif(left(btrim(coalesce(p_message, '')), 2000), ''),
    v_venue,
    'new', 'web', null, null
  );
end;
$$;

revoke all on function public.submit_inquiry(
  text, text, text, text, text, text, date, text, text, text, text
) from public;

grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, date, text, text, text, text
) to anon, authenticated;

analyze public.inquiries;
