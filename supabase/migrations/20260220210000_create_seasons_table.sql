-- ============================================================
-- Migration: Create seasons table and link to battle reports
-- Feature: Season Information
-- ============================================================

-- 1. Create seasons table
create table public.seasons (
  id serial primary key,
  name text not null,
  start_date date not null,
  end_date date not null,
  battle_points_id integer not null references public.battle_points(id),
  description text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint end_after_start check (end_date > start_date)
);

-- Enforce only one active season at a time
create unique index seasons_single_active on public.seasons (is_active) where is_active = true;

-- Reuse existing updated_at trigger
create trigger on_seasons_updated
  before update on public.seasons
  for each row
  execute function public.handle_updated_at();

-- 2. Add season_id to battle_reports
alter table public.battle_reports
  add column season_id integer references public.seasons(id);

-- 3. Auto-assign active season on battle report insert
create or replace function public.assign_battle_report_season()
returns trigger as $$
begin
  select id into new.season_id
    from public.seasons
   where is_active = true
   limit 1;
  return new;
end;
$$ language plpgsql;

create trigger on_battle_report_assign_season
  before insert on public.battle_reports
  for each row
  execute function public.assign_battle_report_season();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.seasons enable row level security;

-- Seasons are publicly readable
create policy "Seasons are publicly readable"
  on public.seasons for select
  to anon, authenticated
  using (true);

-- Only admins can create seasons
create policy "Admins can create seasons"
  on public.seasons for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- Only admins can update seasons
create policy "Admins can update seasons"
  on public.seasons for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );
