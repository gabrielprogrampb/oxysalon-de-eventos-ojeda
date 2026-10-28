-- =============================================================================
-- OXYSALON DE EVENTOS OJEDA — Esquema de base de datos (Supabase / PostgreSQL)
-- =============================================================================
-- Cómo usar:
--   1. Supabase → SQL Editor → New query
--   2. Pegar TODO este archivo y ejecutar (Run)
--   3. Es idempotente: se puede volver a ejecutar sin romper nada.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensiones
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Administradores
--    Solo los usuarios listados aquí pueden leer/editar el panel.
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- Función auxiliar usada por todas las políticas RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- 2. Solicitudes / cotizaciones (formulario público)
-- -----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  name            text not null check (char_length(name) between 2 and 120),
  email           text not null check (char_length(email) between 5 and 160),
  phone           text not null check (char_length(phone) between 6 and 40),
  instagram       text check (char_length(instagram) <= 80),
  telegram        text check (char_length(telegram) <= 80),
  event_type      text check (char_length(event_type) <= 60),
  event_date      date,
  guests_range    text check (char_length(guests_range) <= 40),
  space_interest  text check (char_length(space_interest) <= 120),
  message         text check (char_length(message) <= 2000),
  status          text not null default 'new'
                  check (status in ('new', 'contacted', 'quoted', 'booked', 'lost')),
  value           numeric(12, 2) check (value is null or value >= 0),
  notes           text check (char_length(notes) <= 2000),
  source          text not null default 'web',
  user_agent      text
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);

-- -----------------------------------------------------------------------------
-- 3. Galería
-- -----------------------------------------------------------------------------
create table if not exists public.gallery_items (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  title       text check (char_length(title) <= 120),
  category    text check (char_length(category) <= 60),
  image_url   text not null,
  type        text not null default 'wide' check (type in ('wide', 'tall', 'square')),
  likes       integer not null default 0 check (likes >= 0),
  featured    boolean not null default false,
  published   boolean not null default true,
  sort_order  integer not null default 0
);

create index if not exists gallery_items_published_idx on public.gallery_items (published, sort_order);

-- -----------------------------------------------------------------------------
-- 4. Finanzas
-- -----------------------------------------------------------------------------
create table if not exists public.transactions (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  title        text not null check (char_length(title) between 2 and 160),
  amount       numeric(12, 2) not null check (amount >= 0),
  type         text not null check (type in ('income', 'expense')),
  category     text not null default 'General' check (char_length(category) <= 60),
  date         date not null default current_date,
  status       text not null default 'completed' check (status in ('completed', 'pending')),
  inquiry_id   bigint references public.inquiries (id) on delete set null
);

create index if not exists transactions_date_idx on public.transactions (date desc);

-- -----------------------------------------------------------------------------
-- 5. Agenda / disponibilidad
-- -----------------------------------------------------------------------------
create table if not exists public.calendar_events (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  date        date not null unique,
  status      text not null default 'booked' check (status in ('booked', 'hold', 'maintenance')),
  title       text check (char_length(title) <= 120),
  time_start  time,
  time_end    time,
  notes       text check (char_length(notes) <= 1000)
);

-- Vista pública: expone SOLO fecha y estado (nunca títulos ni notas privadas)
create or replace view public.calendar_public as
  select date, status
  from public.calendar_events;

-- -----------------------------------------------------------------------------
-- 6. Estadísticas de visitas
-- -----------------------------------------------------------------------------
create table if not exists public.page_views (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  path        text check (char_length(path) <= 200)
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

-- -----------------------------------------------------------------------------
-- 7. Trigger updated_at
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists inquiries_touch_updated_at on public.inquiries;
create trigger inquiries_touch_updated_at
  before update on public.inquiries
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- 8. ROW LEVEL SECURITY
-- =============================================================================
alter table public.admins         enable row level security;
alter table public.inquiries      enable row level security;
alter table public.gallery_items  enable row level security;
alter table public.transactions   enable row level security;
alter table public.calendar_events enable row level security;
alter table public.page_views     enable row level security;

-- ---------- admins ----------
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- ---------- inquiries ----------
-- El público SOLO puede insertar solicitudes nuevas, con estado 'new'.
drop policy if exists "inquiries_public_insert" on public.inquiries;
create policy "inquiries_public_insert" on public.inquiries
  for insert to anon, authenticated
  with check (status = 'new' and source = 'web');

-- Solo administradores leen, actualizan o borran.
drop policy if exists "inquiries_admin_select" on public.inquiries;
create policy "inquiries_admin_select" on public.inquiries
  for select to authenticated
  using (public.is_admin());

drop policy if exists "inquiries_admin_update" on public.inquiries;
create policy "inquiries_admin_update" on public.inquiries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "inquiries_admin_delete" on public.inquiries;
create policy "inquiries_admin_delete" on public.inquiries
  for delete to authenticated
  using (public.is_admin());

-- ---------- gallery_items ----------
drop policy if exists "gallery_public_read" on public.gallery_items;
create policy "gallery_public_read" on public.gallery_items
  for select to anon, authenticated
  using (published = true or public.is_admin());

drop policy if exists "gallery_admin_write" on public.gallery_items;
create policy "gallery_admin_write" on public.gallery_items
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "gallery_admin_update" on public.gallery_items;
create policy "gallery_admin_update" on public.gallery_items
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "gallery_admin_delete" on public.gallery_items;
create policy "gallery_admin_delete" on public.gallery_items
  for delete to authenticated
  using (public.is_admin());

-- ---------- transactions (solo admin) ----------
drop policy if exists "transactions_admin_all" on public.transactions;
create policy "transactions_admin_all" on public.transactions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- calendar_events (solo admin) ----------
drop policy if exists "calendar_admin_all" on public.calendar_events;
create policy "calendar_admin_all" on public.calendar_events
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- page_views ----------
drop policy if exists "views_public_insert" on public.page_views;
create policy "views_public_insert" on public.page_views
  for insert to anon, authenticated
  with check (path is null or char_length(path) <= 200);

drop policy if exists "views_admin_read" on public.page_views;
create policy "views_admin_read" on public.page_views
  for select to authenticated
  using (public.is_admin());

-- =============================================================================
-- 9. Permisos de la vista pública de agenda
-- =============================================================================
grant select on public.calendar_public to anon, authenticated;

-- =============================================================================
-- 10. RPC: "me gusta" en la galería (sin permitir updates arbitrarios)
-- =============================================================================
create or replace function public.like_gallery_item(item_id bigint)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_likes integer;
begin
  update public.gallery_items
     set likes = likes + 1
   where id = item_id
     and published = true
  returning likes into new_likes;

  return coalesce(new_likes, 0);
end;
$$;

grant execute on function public.like_gallery_item(bigint) to anon, authenticated;

-- =============================================================================
-- 11. STORAGE: bucket público de galería (lectura pública, escritura admin)
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

drop policy if exists "gallery_storage_public_read" on storage.objects;
create policy "gallery_storage_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'gallery');

drop policy if exists "gallery_storage_admin_insert" on storage.objects;
create policy "gallery_storage_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery_storage_admin_update" on storage.objects;
create policy "gallery_storage_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery_storage_admin_delete" on storage.objects;
create policy "gallery_storage_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

-- =============================================================================
-- 12. DATOS INICIALES DE LA AGENDA (opcional, se puede borrar)
-- =============================================================================
insert into public.calendar_events (date, status, title)
values
  (current_date + 15, 'booked', 'Boda privada'),
  (current_date + 22, 'booked', 'Quince años'),
  (current_date + 35, 'hold', 'Reserva tentativa')
on conflict (date) do nothing;

-- =============================================================================
-- LISTO.
-- Siguiente paso obligatorio: registrar el usuario administrador.
--   1. Authentication → Users → Add user (email + contraseña)
--   2. Copiar el UUID del usuario y ejecutar:
--
--      insert into public.admins (user_id, email, full_name)
--      values ('PEGAR-UUID-AQUI', 'correo@dominio.com', 'Nombre Apellido')
--      on conflict (user_id) do nothing;
--
--   Sin este paso el panel NO se abre (por diseño).
-- =============================================================================
