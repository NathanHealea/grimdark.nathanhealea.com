-- Seed data for local development
-- Password for all users: Password1234
-- Email pattern: user#@grimdark.nathanhealea.com
--
-- Roles, factions, missions, deployments, and battle_points are seeded by migrations.
-- This file seeds: auth users, profiles, faction assignments, seasons, battle reports, rosters.
--
-- Users:
--   llamanat3r@grimdark.nathanhealea.com  Llamanat3r   (admin auth role, organizer profile role)
--   organizer@grimdark.nathanhealea  WarSmith_IX  (organizer auth role, organizer profile role)
--   user3@grimdark.nathanhealea.com  BoltMagnet   (member)
--   user4@grimdark.nathanhealea.com  DiceGoblin   (member)
--   user5@grimdark.nathanhealea.com  VoidReaper   (member)

-- ============================================================================
-- Auth Users
-- ============================================================================
-- email_change set explicitly to '' to avoid GoTrue v2.186.0 NULL scan bug
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, email_change,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES
  ('a0000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'llamanat3r@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('a0000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'organizer@grimdark.nathanhealea',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('a0000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'user3@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('a0000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'user4@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('a0000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'user5@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', '')
ON CONFLICT (id) DO NOTHING;

-- Fix GoTrue v2.186.0 NULL scan bug: GoTrue scans nullable varchar columns into
-- Go strings, which fails on NULL. Set all nullable text columns to empty string.
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '');

-- Auth identities (required for Supabase email auth to work)
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001', 'email',
   '{"sub":"a0000000-0000-4000-8000-000000000001","email":"llamanat3r@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000002', 'email',
   '{"sub":"a0000000-0000-4000-8000-000000000002","email":"organizer@grimdark.nathanhealea"}',
   now(), now(), now()),
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000003', 'email',
   '{"sub":"a0000000-0000-4000-8000-000000000003","email":"user3@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000004', 'email',
   '{"sub":"a0000000-0000-4000-8000-000000000004","email":"user4@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005',
   'a0000000-0000-4000-8000-000000000005', 'email',
   '{"sub":"a0000000-0000-4000-8000-000000000005","email":"user5@grimdark.nathanhealea.com"}',
   now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Auth Roles
-- ============================================================================
-- Trigger handle_new_profile_role auto-assigns role_id=1 ('user') on profile creation.
-- Only manually assign admin (2) and organizer (3).
INSERT INTO public.user_roles (user_id, role_id) VALUES
  ('a0000000-0000-4000-8000-000000000001', 3),  -- Llamanat3r: admin
  ('a0000000-0000-4000-8000-000000000002', 4)   -- WarSmith_IX: organizer
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- Profiles
-- ============================================================================
-- profile_id auto-increments via sequence. user_id links to auth.users.
INSERT INTO public.profiles (id, user_id, display_name, bio, role, created_at, updated_at) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'Llamanat3r',
   'What started as painting a few models for a friend has now turned into purging heretics off the table with flamers and meltas. The Emperor''s light shall guide our fight!',
   'organizer', now() - interval '30 days', now()),
  ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002',
   'WarSmith_IX',
   'Iron within, iron without. The galaxy will burn beneath the treads of the Iron Warriors.',
   'organizer', now() - interval '25 days', now()),
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003',
   'BoltMagnet',
   'For Sanguinius! The Death Company hungers for vengeance.',
   'member', now() - interval '20 days', now()),
  ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004',
   'DiceGoblin',
   'WAAAGH! Green iz best! More dakka solves every problem.',
   'member', now() - interval '15 days', now()),
  ('a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005',
   'VoidReaper',
   'Grandfather Nurgle provides. Embrace the rot, accept the gifts.',
   'member', now() - interval '10 days', now())
ON CONFLICT (id) DO NOTHING;

SELECT setval('profiles_profile_id_seq', (SELECT COALESCE(MAX(profile_id), 1) FROM public.profiles));

-- ============================================================================
-- Profile Factions (lookup by name since faction UUIDs are auto-generated)
-- ============================================================================
INSERT INTO public.profile_factions (profile_id, faction_id)
SELECT p.id, f.id FROM (VALUES
  ('Llamanat3r', 'Adepta Sororitas'),
  ('WarSmith_IX', 'Tyranids'),
  ('WarSmith_IX', 'Drukhari'),
  ('BoltMagnet', 'Blood Angels'),
  ('DiceGoblin', 'Orks'),
  ('VoidReaper', 'Death Guard'),
  ('VoidReaper', 'Chaos Space Marines')
) AS v(display_name, faction_name)
JOIN public.profiles p ON p.display_name = v.display_name
JOIN public.factions f ON f.name = v.faction_name
ON CONFLICT (profile_id, faction_id) DO NOTHING;

-- ============================================================================
-- Seasons (3: past, current, future)
-- ============================================================================
-- battle_points_id: 5 = Strike Force (2000), 6 = Onslaught (3000)
INSERT INTO public.seasons (id, number, name, start_date, end_date, battle_points_id, description, rules, status) VALUES
  (1, 1, 'Prelude to War',
   '2025-10-01', '2025-12-31', 5,
   'The opening salvos have been fired across the Segmentum Pacificus. Warlords test their mettle in skirmishes, forging rivalries that will define the wars to come. Every commander must prove their worth before the true crusade begins.',
   E'Season Rules\n- Round Robin style, each player will play each other player.\n- Games are played at Strike Force (2000 pts).\n\nFaction Rules\n1. You must stay with the same faction throughout the season.\n2. You can change army list between games.',
   'published'),
  (2, 2, 'The Crusade Begins',
   '2026-02-01', '2026-04-30', 5,
   'War has come in earnest. Ancient rivalries reignite as commanders marshal their forces for dominance. Every battle shapes the standings. Every victory echoes across the sector. There is no peace amongst the stars. Only war.',
   E'Season Rules\n- Round Robin style, each player will play each other player.\n- No Challenge or Twist Cards.\n- Games are played at Strike Force (2000 pts).\n\nFaction Rules\n1. You must stay with the same faction throughout the season.\n2. You can change army list between games.\n\nGame Setup Rules\n1. Set up Terrain.\n2. Set up Objective Markers.\n3. Draw Mission card and layout deployment zones.\n4. Roll off — winner decides Attacker or Defender.\n5. Roll off — winner decides who goes first.',
   'published'),
  (3, 3, 'The Dark Imperium',
   '2026-06-01', '2026-08-31', 6,
   'The stakes have never been higher. Onslaught-scale warfare engulfs the sector as the greatest commanders bring their full might to bear. Only the strongest will survive the Dark Imperium.',
   NULL,
   'draft')
ON CONFLICT (id) DO NOTHING;

SELECT setval('seasons_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.seasons));

-- ============================================================================
-- Season Rosters (faction lookup by name)
-- ============================================================================
-- Season 1 (past): 4 players
INSERT INTO public.season_roster (season_id, profile_id, faction_id, joined_at)
SELECT 1, p.id, f.id, v.joined_at::timestamptz
FROM (VALUES
  ('Llamanat3r', 'Adepta Sororitas', '2025-09-28 10:00:00+00'),
  ('BoltMagnet', 'Blood Angels', '2025-09-28 12:00:00+00'),
  ('DiceGoblin', 'Orks', '2025-09-29 09:00:00+00'),
  ('VoidReaper', 'Death Guard', '2025-09-30 14:00:00+00')
) AS v(display_name, faction_name, joined_at)
JOIN public.profiles p ON p.display_name = v.display_name
JOIN public.factions f ON f.name = v.faction_name
ON CONFLICT (season_id, profile_id) DO NOTHING;

-- Season 2 (current): all 5 players
INSERT INTO public.season_roster (season_id, profile_id, faction_id, joined_at)
SELECT 2, p.id, f.id, v.joined_at::timestamptz
FROM (VALUES
  ('Llamanat3r', 'Adepta Sororitas', '2026-01-25 10:00:00+00'),
  ('WarSmith_IX', 'Tyranids', '2026-01-26 11:00:00+00'),
  ('BoltMagnet', 'Blood Angels', '2026-01-27 09:00:00+00'),
  ('DiceGoblin', 'Orks', '2026-01-28 15:00:00+00'),
  ('VoidReaper', 'Death Guard', '2026-01-29 08:00:00+00')
) AS v(display_name, faction_name, joined_at)
JOIN public.profiles p ON p.display_name = v.display_name
JOIN public.factions f ON f.name = v.faction_name
ON CONFLICT (season_id, profile_id) DO NOTHING;

-- Season 3 (future): 3 early sign-ups
INSERT INTO public.season_roster (season_id, profile_id, faction_id, joined_at)
SELECT 3, p.id, f.id, v.joined_at::timestamptz
FROM (VALUES
  ('Llamanat3r', 'Adepta Sororitas', '2026-03-01 10:00:00+00'),
  ('WarSmith_IX', 'Drukhari', '2026-03-01 12:00:00+00'),
  ('BoltMagnet', 'Blood Angels', '2026-03-02 09:00:00+00')
) AS v(display_name, faction_name, joined_at)
JOIN public.profiles p ON p.display_name = v.display_name
JOIN public.factions f ON f.name = v.faction_name
ON CONFLICT (season_id, profile_id) DO NOTHING;

-- ============================================================================
-- Battle Reports (10 reports with mixed outcomes across seasons)
-- ============================================================================
-- Season 1 reports (past season)

-- Report 1: Llamanat3r (Sororitas) wins vs BoltMagnet (Blood Angels)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000001'::uuid, af.id, 45, 'win',
  'a0000000-0000-4000-8000-000000000003'::uuid, df.id, 32, 'loss',
  1, 1, 5, 5, 'a0000000-0000-4000-8000-000000000001'::uuid,
  '2025-10-15'::date, 1, 'published', '2025-10-15 20:00:00+00'::timestamptz, '2025-10-15 20:00:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Adepta Sororitas' AND df.name = 'Blood Angels'
ON CONFLICT (id) DO NOTHING;

-- Report 2: DiceGoblin (Orks) draws with VoidReaper (Death Guard)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000002'::uuid,
  'a0000000-0000-4000-8000-000000000004'::uuid, af.id, 38, 'draw',
  'a0000000-0000-4000-8000-000000000005'::uuid, df.id, 38, 'draw',
  3, 2, 5, 4, 'a0000000-0000-4000-8000-000000000004'::uuid,
  '2025-10-22'::date, 1, 'published', '2025-10-22 19:30:00+00'::timestamptz, '2025-10-22 19:30:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Orks' AND df.name = 'Death Guard'
ON CONFLICT (id) DO NOTHING;

-- Report 3: BoltMagnet (Blood Angels) wins vs DiceGoblin (Orks)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000003'::uuid,
  'a0000000-0000-4000-8000-000000000003'::uuid, af.id, 52, 'win',
  'a0000000-0000-4000-8000-000000000004'::uuid, df.id, 28, 'loss',
  5, 3, 5, 5, 'a0000000-0000-4000-8000-000000000003'::uuid,
  '2025-11-05'::date, 1, 'published', '2025-11-05 21:00:00+00'::timestamptz, '2025-11-05 21:00:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Blood Angels' AND df.name = 'Orks'
ON CONFLICT (id) DO NOTHING;

-- Report 4: VoidReaper (Death Guard) wins vs Llamanat3r (Sororitas)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000004'::uuid,
  'a0000000-0000-4000-8000-000000000005'::uuid, af.id, 41, 'win',
  'a0000000-0000-4000-8000-000000000001'::uuid, df.id, 35, 'loss',
  7, 4, 5, 4, 'a0000000-0000-4000-8000-000000000005'::uuid,
  '2025-11-19'::date, 1, 'published', '2025-11-19 18:30:00+00'::timestamptz, '2025-11-19 18:30:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Death Guard' AND df.name = 'Adepta Sororitas'
ON CONFLICT (id) DO NOTHING;

-- Season 2 reports (current season)

-- Report 5: Llamanat3r (Sororitas) wins vs WarSmith_IX (Tyranids)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000005'::uuid,
  'a0000000-0000-4000-8000-000000000001'::uuid, af.id, 60, 'win',
  'a0000000-0000-4000-8000-000000000002'::uuid, df.id, 45, 'loss',
  2, 5, 5, 5, 'a0000000-0000-4000-8000-000000000001'::uuid,
  '2026-02-10'::date, 2, 'published', '2026-02-10 20:00:00+00'::timestamptz, '2026-02-10 20:00:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Adepta Sororitas' AND df.name = 'Tyranids'
ON CONFLICT (id) DO NOTHING;

-- Report 6: VoidReaper (Death Guard) wins vs BoltMagnet (Blood Angels) — defender wins
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000006'::uuid,
  'a0000000-0000-4000-8000-000000000003'::uuid, af.id, 48, 'loss',
  'a0000000-0000-4000-8000-000000000005'::uuid, df.id, 55, 'win',
  4, 6, 5, 5, 'a0000000-0000-4000-8000-000000000003'::uuid,
  '2026-02-17'::date, 2, 'published', '2026-02-17 19:00:00+00'::timestamptz, '2026-02-17 19:00:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Blood Angels' AND df.name = 'Death Guard'
ON CONFLICT (id) DO NOTHING;

-- Report 7: DiceGoblin (Orks) wins vs WarSmith_IX (Tyranids)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000007'::uuid,
  'a0000000-0000-4000-8000-000000000004'::uuid, af.id, 42, 'win',
  'a0000000-0000-4000-8000-000000000002'::uuid, df.id, 30, 'loss',
  6, 7, 5, 3, 'a0000000-0000-4000-8000-000000000004'::uuid,
  '2026-02-22'::date, 2, 'published', '2026-02-22 21:00:00+00'::timestamptz, '2026-02-22 21:00:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Orks' AND df.name = 'Tyranids'
ON CONFLICT (id) DO NOTHING;

-- Report 8: Llamanat3r (Sororitas) wins vs DiceGoblin (Orks)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000008'::uuid,
  'a0000000-0000-4000-8000-000000000001'::uuid, af.id, 51, 'win',
  'a0000000-0000-4000-8000-000000000004'::uuid, df.id, 39, 'loss',
  8, 1, 5, 5, 'a0000000-0000-4000-8000-000000000001'::uuid,
  '2026-02-28'::date, 2, 'published', '2026-02-28 20:30:00+00'::timestamptz, '2026-02-28 20:30:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Adepta Sororitas' AND df.name = 'Orks'
ON CONFLICT (id) DO NOTHING;

-- Report 9: WarSmith_IX (Tyranids) draws with BoltMagnet (Blood Angels)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000009'::uuid,
  'a0000000-0000-4000-8000-000000000002'::uuid, af.id, 44, 'draw',
  'a0000000-0000-4000-8000-000000000003'::uuid, df.id, 44, 'draw',
  9, 2, 5, 5, 'a0000000-0000-4000-8000-000000000002'::uuid,
  '2026-03-01'::date, 2, 'published', '2026-03-01 19:00:00+00'::timestamptz, '2026-03-01 19:00:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Tyranids' AND df.name = 'Blood Angels'
ON CONFLICT (id) DO NOTHING;

-- No-season pickup game

-- Report 10: VoidReaper (Chaos Space Marines) wins vs DiceGoblin (Orks)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  event_date, season_id, status, created_at, updated_at
)
SELECT
  'b0000000-0000-4000-8000-000000000010'::uuid,
  'a0000000-0000-4000-8000-000000000005'::uuid, af.id, 55, 'win',
  'a0000000-0000-4000-8000-000000000004'::uuid, df.id, 22, 'loss',
  10, 3, 5, 3, 'a0000000-0000-4000-8000-000000000005'::uuid,
  '2026-01-12'::date, NULL, 'published', '2026-01-12 18:00:00+00'::timestamptz, '2026-01-12 18:00:00+00'::timestamptz
FROM public.factions af, public.factions df
WHERE af.name = 'Chaos Space Marines' AND df.name = 'Orks'
ON CONFLICT (id) DO NOTHING;
