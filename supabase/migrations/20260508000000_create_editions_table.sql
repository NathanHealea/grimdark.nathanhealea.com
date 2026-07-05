-- ============================================================
-- Migration: Create editions table
-- Feature: Editions Data Model
-- ============================================================

create table public.editions (
  id serial primary key,
  name text not null,
  short_name text not null,
  description text,
  status text not null default 'draft',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint editions_status_check check (status in ('draft', 'published'))
);

-- Only one default edition at a time (mirrors seasons_single_active pattern)
create unique index editions_single_default
  on public.editions (is_default)
  where is_default = true;

-- Stable short label (e.g., "10th", "11th")
create unique index editions_short_name_key
  on public.editions (short_name);

-- Reuse existing updated_at trigger
create trigger on_editions_updated
  before update on public.editions
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.editions enable row level security;

create policy "Published editions are publicly readable"
  on public.editions for select
  using (status = 'published');

create policy "Admins and organizers can view all editions"
  on public.editions for select
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can insert editions"
  on public.editions for insert
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can update editions"
  on public.editions for update
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can delete editions"
  on public.editions for delete
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

-- ============================================================
-- Seed
-- ============================================================

insert into public.editions (name, short_name, description, status, is_default) values
  ('10th Edition', '10th', 'Warhammer 40,000 10th Edition', 'published', true),
  ('11th Edition', '11th', 'Warhammer 40,000 11th Edition', 'published', false);
