-- ============================================================
-- Migration: Create battle report tables
-- Feature: Battle Reports (Submit Battle Report)
-- ============================================================

-- 1. Missions lookup table
create table public.missions (
  id serial primary key,
  name text unique not null
);

insert into public.missions (name) values
  ('Burden of Trust'),
  ('Hidden Supplies'),
  ('Linchpin'),
  ('Purge the Foe'),
  ('Scorched Earth'),
  ('Supply Drop'),
  ('Take and Hold'),
  ('Terraform'),
  ('The Ritual'),
  ('Unexplored Ordnances');

-- 2. Deployments lookup table
create table public.deployments (
  id serial primary key,
  name text unique not null
);

insert into public.deployments (name) values
  ('Dawn of War'),
  ('Hammer and Anvil'),
  ('Search and Destroy'),
  ('Sweeping Engagement'),
  ('Crucible of Battle'),
  ('Tipping Point'),
  ('Outflank');

-- 3. Battle points lookup table
create table public.battle_points (
  id serial primary key,
  name text unique not null,
  size integer not null
);

insert into public.battle_points (name, size) values
  ('Combat Patrol', 500),
  ('Blitz', 750),
  ('Incursion', 1000),
  ('Assault', 1500),
  ('Strike Force', 2000),
  ('Onslaught', 3000);

-- 4. Battle reports table
create table public.battle_reports (
  id uuid primary key default gen_random_uuid(),
  attacker_id uuid not null references public.profiles(id),
  attacker_faction_id uuid not null references public.factions(id),
  attacker_score integer not null check (attacker_score >= 0),
  attacker_outcome text not null check (attacker_outcome in ('win', 'loss', 'draw')),
  defender_id uuid not null references public.profiles(id),
  defender_faction_id uuid not null references public.factions(id),
  defender_score integer not null check (defender_score >= 0),
  defender_outcome text not null check (defender_outcome in ('win', 'loss', 'draw')),
  mission_id integer not null references public.missions(id),
  deployment_id integer not null references public.deployments(id),
  battle_points_id integer not null references public.battle_points(id),
  rounds integer not null check (rounds >= 1 and rounds <= 5),
  reported_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attacker_defender_different check (attacker_id != defender_id)
);

-- Updated_at trigger (reuses existing handle_updated_at function)
create trigger on_battle_reports_updated
  before update on public.battle_reports
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.missions enable row level security;
alter table public.deployments enable row level security;
alter table public.battle_points enable row level security;
alter table public.battle_reports enable row level security;

-- Lookup tables: publicly readable
create policy "Missions are publicly readable"
  on public.missions for select to anon, authenticated using (true);

create policy "Deployments are publicly readable"
  on public.deployments for select to anon, authenticated using (true);

create policy "Battle points are publicly readable"
  on public.battle_points for select to anon, authenticated using (true);

-- Battle reports: publicly readable
create policy "Battle reports are publicly readable"
  on public.battle_reports for select to anon, authenticated using (true);

-- Battle reports: members and admins can insert
create policy "Members and admins can submit battle reports"
  on public.battle_reports
  for insert
  to authenticated
  with check (
    auth.uid() = reported_by
    and 'member' = any(public.get_user_roles(auth.uid()))
    or 'admin' = any(public.get_user_roles(auth.uid()))
  );

-- Battle reports: reporter or admin can update
create policy "Reporter or admin can update battle reports"
  on public.battle_reports
  for update
  to authenticated
  using (
    auth.uid() = reported_by
    or 'admin' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    auth.uid() = reported_by
    or 'admin' = any(public.get_user_roles(auth.uid()))
  );
