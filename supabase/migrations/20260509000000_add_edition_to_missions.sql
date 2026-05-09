-- ============================================================
-- Migration: Scope missions to editions
-- Feature: Edition Missions Management
-- ============================================================

-- 1. Add edition_id (nullable to allow backfill)
alter table public.missions
  add column edition_id integer references public.editions(id) on delete cascade;

-- 2. Backfill existing missions to 10th Edition
update public.missions
   set edition_id = (select id from public.editions where short_name = '10th');

-- 3. Enforce NOT NULL
alter table public.missions
  alter column edition_id set not null;

-- 4. Replace global uniqueness with per-edition uniqueness
alter table public.missions
  drop constraint missions_name_key;

alter table public.missions
  add constraint missions_edition_name_unique unique (edition_id, name);

-- ============================================================
-- Row Level Security: edition-aware policies
-- ============================================================

drop policy if exists "Missions are publicly readable" on public.missions;

create policy "Published edition missions are publicly readable"
  on public.missions for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.editions e
       where e.id = missions.edition_id
         and e.status = 'published'
    )
  );

create policy "Admins and organizers can read all missions"
  on public.missions for select
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can insert missions"
  on public.missions for insert
  to authenticated
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can update missions"
  on public.missions for update
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can delete missions"
  on public.missions for delete
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );
