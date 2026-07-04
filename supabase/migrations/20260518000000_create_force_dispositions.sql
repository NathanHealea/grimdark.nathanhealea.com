-- ============================================================
-- Migration: Create force_dispositions table + mission mapping
-- Feature: Force Dispositions Data Model
-- ============================================================

create table public.force_dispositions (
  id serial primary key,
  edition_id integer not null references public.editions(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint force_dispositions_edition_name_unique unique (edition_id, name)
);

-- Reuse existing updated_at trigger
create trigger on_force_dispositions_updated
  before update on public.force_dispositions
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Row Level Security (mirrors missions policies)
-- ============================================================

alter table public.force_dispositions enable row level security;

create policy "Published edition force dispositions are publicly readable"
  on public.force_dispositions for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.editions e
       where e.id = force_dispositions.edition_id
         and e.status = 'published'
    )
  );

create policy "Admins and organizers can read all force dispositions"
  on public.force_dispositions for select
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can insert force dispositions"
  on public.force_dispositions for insert
  to authenticated
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can update force dispositions"
  on public.force_dispositions for update
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can delete force dispositions"
  on public.force_dispositions for delete
  to authenticated
  using (
    'admin' = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

-- ============================================================
-- Mission mapping columns (a mapped mission is one cell of the
-- disposition matchup matrix: deck disposition vs opponent)
-- ============================================================

alter table public.missions
  add column force_disposition_id integer references public.force_dispositions(id) on delete restrict,
  add column opponent_force_disposition_id integer references public.force_dispositions(id) on delete restrict;

-- A mission is either classic (both null) or a deck mission (both set)
alter table public.missions
  add constraint missions_disposition_both_or_neither
  check ((force_disposition_id is null) = (opponent_force_disposition_id is null));

-- At most one mission per (edition, deck, opponent) matchup cell
create unique index missions_disposition_pairing_unique
  on public.missions (edition_id, force_disposition_id, opponent_force_disposition_id)
  where force_disposition_id is not null;

-- ============================================================
-- Seed: the five 11th edition Force Dispositions
-- ============================================================

insert into public.force_dispositions (edition_id, name, description)
select e.id, d.name, d.description
from public.editions e,
     (values
       ('Take and Hold', 'Hold objectives; the only deck that can reward holding your home objective.'),
       ('Purge the Foe', 'Destroy enemy units while contesting objectives.'),
       ('Reconnaissance', 'Scout the battlefield and seize key intelligence positions — get around the table and perform actions.'),
       ('Priority Assets', 'Capture and hold the high value assets scattered across the field.'),
       ('Disruption', 'Disrupt the enemy battle plan and deny them the field.')
     ) as d(name, description)
where e.short_name = '11th'
on conflict (edition_id, name) do nothing;
