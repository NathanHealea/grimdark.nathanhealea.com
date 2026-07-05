-- ============================================================
-- Migration: Scope deployments to editions
-- Feature: Edition Deployments Management
-- ============================================================

-- 1. Add edition_id (nullable to allow backfill)
alter table public.deployments
  add column edition_id integer references public.editions(id) on delete cascade;

-- 2. Backfill existing deployments to 10th Edition
update public.deployments
   set edition_id = (select id from public.editions where short_name = '10th');

-- 3. Enforce NOT NULL
alter table public.deployments
  alter column edition_id set not null;

-- 4. Replace global uniqueness with per-edition uniqueness
alter table public.deployments
  drop constraint deployments_name_key;

alter table public.deployments
  add constraint deployments_edition_name_unique unique (edition_id, name);

-- ============================================================
-- Row Level Security: edition-aware policies
-- ============================================================

drop policy if exists "Deployments are publicly readable" on public.deployments;

create policy "Published edition deployments are publicly readable"
  on public.deployments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.editions e
       where e.id = deployments.edition_id
         and e.status = 'published'
    )
  );

create policy "Admins and organizers can read all deployments"
  on public.deployments for select
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can insert deployments"
  on public.deployments for insert
  to authenticated
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can update deployments"
  on public.deployments for update
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can delete deployments"
  on public.deployments for delete
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );
