-- ============================================================
-- Migration: Seed 11th edition deployments + primary missions
-- Feature: 11th Edition Data Seed
-- Source: docs/editions/11th-edition-mission-data.md
-- ============================================================

-- ------------------------------------------------------------
-- Deployments (6)
-- ------------------------------------------------------------

insert into public.deployments (name, edition_id)
select d.name, e.id
from public.editions e,
     (values
       ('Crucible of Battle'),
       ('Dawn of War'),
       ('Hammer and Anvil'),
       ('Search and Destroy'),
       ('Sweeping Engagement'),
       ('Tipping Point')
     ) as d(name)
where e.short_name = '11th'
on conflict (edition_id, name) do nothing;

-- ------------------------------------------------------------
-- Primary missions (25): one per (deck disposition, opponent
-- disposition) cell of the 5x5 matchup matrix
-- ------------------------------------------------------------

with ed as (
  select id from public.editions where short_name = '11th'
),
fd as (
  select id, name from public.force_dispositions
   where edition_id = (select id from ed)
),
matrix (name, deck, vs) as (
  values
    -- Take and Hold deck
    ('Battlefield Dominance',  'Take and Hold',   'Take and Hold'),
    ('Immovable Object',       'Take and Hold',   'Purge the Foe'),
    ('Purge and Secure',       'Take and Hold',   'Reconnaissance'),
    ('Inescapable Dominion',   'Take and Hold',   'Priority Assets'),
    ('Determined Acquisition', 'Take and Hold',   'Disruption'),
    -- Purge the Foe deck
    ('Unstoppable Force',      'Purge the Foe',   'Take and Hold'),
    ('Meatgrinder',            'Purge the Foe',   'Purge the Foe'),
    ('Consecrate',             'Purge the Foe',   'Reconnaissance'),
    ('Destroyer''s Wrath',     'Purge the Foe',   'Priority Assets'),
    ('Punishment',             'Purge the Foe',   'Disruption'),
    -- Reconnaissance deck
    ('Reconnaissance Sweep',   'Reconnaissance',  'Take and Hold'),
    ('Triangulation',          'Reconnaissance',  'Purge the Foe'),
    ('Gather Intel',           'Reconnaissance',  'Reconnaissance'),
    ('Search and Scour',       'Reconnaissance',  'Priority Assets'),
    ('Surveil the Foe',        'Reconnaissance',  'Disruption'),
    -- Priority Assets deck
    ('Secure Asset',           'Priority Assets', 'Take and Hold'),
    ('Vital Link',             'Priority Assets', 'Purge the Foe'),
    ('Vanguard Operation',     'Priority Assets', 'Reconnaissance'),
    ('Sabotage',               'Priority Assets', 'Priority Assets'),
    ('Extract Relic',          'Priority Assets', 'Disruption'),
    -- Disruption deck
    ('Death Trap',             'Disruption',      'Take and Hold'),
    ('Delaying Action',        'Disruption',      'Purge the Foe'),
    ('Smoke and Mirrors',      'Disruption',      'Reconnaissance'),
    ('Locate and Deny',        'Disruption',      'Priority Assets'),
    ('Outmanoeuvre',           'Disruption',      'Disruption')
)
insert into public.missions (name, edition_id, force_disposition_id, opponent_force_disposition_id)
select m.name,
       (select id from ed),
       (select id from fd where fd.name = m.deck),
       (select id from fd where fd.name = m.vs)
from matrix m
on conflict (edition_id, name) do nothing;

-- Backfill mappings on missions an admin pre-entered by name only
with ed as (
  select id from public.editions where short_name = '11th'
),
fd as (
  select id, name from public.force_dispositions
   where edition_id = (select id from ed)
),
matrix (name, deck, vs) as (
  values
    ('Battlefield Dominance',  'Take and Hold',   'Take and Hold'),
    ('Immovable Object',       'Take and Hold',   'Purge the Foe'),
    ('Purge and Secure',       'Take and Hold',   'Reconnaissance'),
    ('Inescapable Dominion',   'Take and Hold',   'Priority Assets'),
    ('Determined Acquisition', 'Take and Hold',   'Disruption'),
    ('Unstoppable Force',      'Purge the Foe',   'Take and Hold'),
    ('Meatgrinder',            'Purge the Foe',   'Purge the Foe'),
    ('Consecrate',             'Purge the Foe',   'Reconnaissance'),
    ('Destroyer''s Wrath',     'Purge the Foe',   'Priority Assets'),
    ('Punishment',             'Purge the Foe',   'Disruption'),
    ('Reconnaissance Sweep',   'Reconnaissance',  'Take and Hold'),
    ('Triangulation',          'Reconnaissance',  'Purge the Foe'),
    ('Gather Intel',           'Reconnaissance',  'Reconnaissance'),
    ('Search and Scour',       'Reconnaissance',  'Priority Assets'),
    ('Surveil the Foe',        'Reconnaissance',  'Disruption'),
    ('Secure Asset',           'Priority Assets', 'Take and Hold'),
    ('Vital Link',             'Priority Assets', 'Purge the Foe'),
    ('Vanguard Operation',     'Priority Assets', 'Reconnaissance'),
    ('Sabotage',               'Priority Assets', 'Priority Assets'),
    ('Extract Relic',          'Priority Assets', 'Disruption'),
    ('Death Trap',             'Disruption',      'Take and Hold'),
    ('Delaying Action',        'Disruption',      'Purge the Foe'),
    ('Smoke and Mirrors',      'Disruption',      'Reconnaissance'),
    ('Locate and Deny',        'Disruption',      'Priority Assets'),
    ('Outmanoeuvre',           'Disruption',      'Disruption')
)
update public.missions ms
   set force_disposition_id = (select id from fd where fd.name = m.deck),
       opponent_force_disposition_id = (select id from fd where fd.name = m.vs)
  from matrix m
 where ms.edition_id = (select id from ed)
   and ms.name = m.name
   and ms.force_disposition_id is null;
