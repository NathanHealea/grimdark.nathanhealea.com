-- Create factions table with self-referencing parent_id for hierarchy
create table public.factions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.factions(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Unique name within the same parent (non-null parent_id)
create unique index factions_parent_name_unique
  on public.factions (parent_id, name)
  where parent_id is not null;

-- Unique name for root factions (null parent_id)
create unique index factions_root_name_unique
  on public.factions (name)
  where parent_id is null;

-- Enable Row Level Security
alter table public.factions enable row level security;

-- Policy: Authenticated users can read all factions
create policy "Factions are viewable by authenticated users"
  on public.factions
  for select
  to authenticated
  using (true);

-- Seed root factions
insert into public.factions (id, parent_id, name) values
  ('10000000-0000-0000-0000-000000000001', null, 'Imperium'),
  ('10000000-0000-0000-0000-000000000002', null, 'Chaos'),
  ('10000000-0000-0000-0000-000000000003', null, 'Xenos');

-- Seed Imperium factions
insert into public.factions (id, parent_id, name) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Adepta Sororitas'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Adeptus Custodes'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Adeptus Mechanicus'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Astra Militarum'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Grey Knights'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'Imperial Knights'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Space Marines');

-- Seed Space Marine sub-factions (chapters)
insert into public.factions (parent_id, name) values
  ('20000000-0000-0000-0000-000000000007', 'Black Templars'),
  ('20000000-0000-0000-0000-000000000007', 'Blood Angels'),
  ('20000000-0000-0000-0000-000000000007', 'Dark Angels'),
  ('20000000-0000-0000-0000-000000000007', 'Deathwatch'),
  ('20000000-0000-0000-0000-000000000007', 'Space Wolves');

-- Seed Chaos factions
insert into public.factions (parent_id, name) values
  ('10000000-0000-0000-0000-000000000002', 'Chaos Daemons'),
  ('10000000-0000-0000-0000-000000000002', 'Chaos Knights'),
  ('10000000-0000-0000-0000-000000000002', 'Chaos Space Marines'),
  ('10000000-0000-0000-0000-000000000002', 'Death Guard'),
  ('10000000-0000-0000-0000-000000000002', 'Thousand Sons'),
  ('10000000-0000-0000-0000-000000000002', 'World Eaters');

-- Seed Xenos factions
insert into public.factions (parent_id, name) values
  ('10000000-0000-0000-0000-000000000003', 'Aeldari'),
  ('10000000-0000-0000-0000-000000000003', 'Drukhari'),
  ('10000000-0000-0000-0000-000000000003', 'Genestealer Cults'),
  ('10000000-0000-0000-0000-000000000003', 'Leagues of Votann'),
  ('10000000-0000-0000-0000-000000000003', 'Necrons'),
  ('10000000-0000-0000-0000-000000000003', 'Orks'),
  ('10000000-0000-0000-0000-000000000003', 'T''au Empire'),
  ('10000000-0000-0000-0000-000000000003', 'Tyranids');
