-- =============================================================================
-- 0004 — PERFIL EDITABLE + GALERÍA MULTI-IMAGEN
-- =============================================================================
-- Ejecutar DESPUÉS de 0003. Es idempotente.
--
-- Qué agrega:
--   1. `update_my_profile()`: permite que cada administrador cambie su propio
--      nombre sin darle permiso de UPDATE sobre toda la tabla `admins`.
--      (Sin esto, el nombre se guardaba en los metadatos de Auth pero nunca
--      aparecía en la lista del equipo ni en la auditoría.)
--   2. `gallery_photos`: varias fotos por tema, cada una con título,
--      descripción, texto alternativo y enlace propio.
--   3. Relleno de las fotos existentes: cada imagen actual se convierte en la
--      primera foto de su tema, así no se pierde nada al actualizar.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Perfil propio
-- -----------------------------------------------------------------------------
create or replace function public.update_my_profile(p_full_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := left(btrim(coalesce(p_full_name, '')), 80);
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if char_length(v_name) < 2 then
    raise exception 'invalid_name';
  end if;

  update public.admins
     set full_name = v_name,
         email = coalesce(email, auth.jwt() ->> 'email')
   where user_id = auth.uid();

  if not found then
    raise exception 'not_admin';
  end if;

  return v_name;
end;
$$;

revoke all on function public.update_my_profile(text) from public, anon;
grant execute on function public.update_my_profile(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Fotos de la galería (varias por tema)
-- -----------------------------------------------------------------------------
create table if not exists public.gallery_photos (
  id          bigserial primary key,
  item_id     bigint not null references public.gallery_items (id) on delete cascade,
  image_url   text not null,
  title       text check (char_length(title) <= 120),
  description text check (char_length(description) <= 400),
  alt         text check (char_length(alt) <= 160),
  link        text check (char_length(link) <= 500),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists gallery_photos_item_idx
  on public.gallery_photos (item_id, sort_order);

-- Evita duplicar la misma URL al re-ejecutar el relleno o al reintentar una subida
create unique index if not exists gallery_photos_item_url_idx
  on public.gallery_photos (item_id, image_url);

alter table public.gallery_photos enable row level security;

drop policy if exists "gallery_photos_public_read" on public.gallery_photos;
create policy "gallery_photos_public_read" on public.gallery_photos
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.gallery_items g
       where g.id = gallery_photos.item_id
         and g.published = true
    )
  );

drop policy if exists "gallery_photos_admin_insert" on public.gallery_photos;
create policy "gallery_photos_admin_insert" on public.gallery_photos
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "gallery_photos_admin_update" on public.gallery_photos;
create policy "gallery_photos_admin_update" on public.gallery_photos
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "gallery_photos_admin_delete" on public.gallery_photos;
create policy "gallery_photos_admin_delete" on public.gallery_photos
  for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. Relleno: la imagen actual pasa a ser la primera foto del tema
-- -----------------------------------------------------------------------------
insert into public.gallery_photos (item_id, image_url, title, sort_order)
select g.id, g.image_url, g.title, 0
  from public.gallery_items g
 where g.image_url is not null
   and btrim(g.image_url) <> ''
on conflict (item_id, image_url) do nothing;

-- Descripción y enlace quedan vacíos a propósito: se completan desde el panel.
-- El título y la categoría del tema siguen viviendo en `gallery_items`.

analyze public.gallery_photos;
