-- Seed data for local development
-- Subset of real data pulled from the live environment (project pbqmepwuxrcnmspnucgh).
--
-- Password for all users: Password1234
-- Email pattern: <user_name>@grimdark.nathanhealea.com
--
-- Roles, factions, missions, deployments, editions, force_dispositions, and
-- battle_points are seeded by migrations. This file seeds: auth users, profiles,
-- faction assignments, the season, season rosters, and battle reports.
--
-- Auth roles: only Llamanat3r is an admin. Everyone else is a plain 'user'
-- (auto-assigned by the handle_new_profile_role trigger on profile insert).
--
-- Users (profile display_name — email — auth role):
--   matt_the_grey          matt_the_grey@grimdark.nathanhealea.com          user
--   palekingwithagun       palekingwithagun@grimdark.nathanhealea.com       user
--   KiloBravo              kilobravo@grimdark.nathanhealea.com              user
--   Knight                 knight@grimdark.nathanhealea.com                 user
--   grand_cappuccino_pptx  grand_cappuccino_pptx@grimdark.nathanhealea.com  user
--   Llamanat3r             llamanat3r@grimdark.nathanhealea.com             admin
--   shield0109             shield0109@grimdark.nathanhealea.com             user
--   bluesnoweyes           bluesnoweyes@grimdark.nathanhealea.com           user

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
  ('ada5319e-3a88-4b3d-9f33-d7d5704932d5', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'matt_the_grey@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('1db9658f-4c92-4e25-baf0-9ff4e0024752', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'palekingwithagun@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('d9f0f8a6-cbfd-40fd-865f-db7013c5cc26', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'kilobravo@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'knight@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('0662f84a-76a1-4421-b068-c05d458386f5', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'grand_cappuccino_pptx@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('733f6fc6-bb3b-4be5-8840-39d20404896d', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'llamanat3r@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('7e98517a-3901-4aa9-837e-fac6c793f9b1', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'shield0109@grimdark.nathanhealea.com',
   crypt('Password1234', gen_salt('bf')), now(), '',
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),
  ('cd361275-f0db-4511-9043-3c1402ae24a1', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'bluesnoweyes@grimdark.nathanhealea.com',
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
  ('ada5319e-3a88-4b3d-9f33-d7d5704932d5', 'ada5319e-3a88-4b3d-9f33-d7d5704932d5',
   'ada5319e-3a88-4b3d-9f33-d7d5704932d5', 'email',
   '{"sub":"ada5319e-3a88-4b3d-9f33-d7d5704932d5","email":"matt_the_grey@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('1db9658f-4c92-4e25-baf0-9ff4e0024752', '1db9658f-4c92-4e25-baf0-9ff4e0024752',
   '1db9658f-4c92-4e25-baf0-9ff4e0024752', 'email',
   '{"sub":"1db9658f-4c92-4e25-baf0-9ff4e0024752","email":"palekingwithagun@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('d9f0f8a6-cbfd-40fd-865f-db7013c5cc26', 'd9f0f8a6-cbfd-40fd-865f-db7013c5cc26',
   'd9f0f8a6-cbfd-40fd-865f-db7013c5cc26', 'email',
   '{"sub":"d9f0f8a6-cbfd-40fd-865f-db7013c5cc26","email":"kilobravo@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2', '8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2',
   '8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2', 'email',
   '{"sub":"8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2","email":"knight@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('0662f84a-76a1-4421-b068-c05d458386f5', '0662f84a-76a1-4421-b068-c05d458386f5',
   '0662f84a-76a1-4421-b068-c05d458386f5', 'email',
   '{"sub":"0662f84a-76a1-4421-b068-c05d458386f5","email":"grand_cappuccino_pptx@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('733f6fc6-bb3b-4be5-8840-39d20404896d', '733f6fc6-bb3b-4be5-8840-39d20404896d',
   '733f6fc6-bb3b-4be5-8840-39d20404896d', 'email',
   '{"sub":"733f6fc6-bb3b-4be5-8840-39d20404896d","email":"llamanat3r@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('7e98517a-3901-4aa9-837e-fac6c793f9b1', '7e98517a-3901-4aa9-837e-fac6c793f9b1',
   '7e98517a-3901-4aa9-837e-fac6c793f9b1', 'email',
   '{"sub":"7e98517a-3901-4aa9-837e-fac6c793f9b1","email":"shield0109@grimdark.nathanhealea.com"}',
   now(), now(), now()),
  ('cd361275-f0db-4511-9043-3c1402ae24a1', 'cd361275-f0db-4511-9043-3c1402ae24a1',
   'cd361275-f0db-4511-9043-3c1402ae24a1', 'email',
   '{"sub":"cd361275-f0db-4511-9043-3c1402ae24a1","email":"bluesnoweyes@grimdark.nathanhealea.com"}',
   now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Profiles
-- ============================================================================
-- profile_id auto-increments via sequence. user_id links to auth.users.
-- The handle_new_profile_role trigger auto-assigns the 'user' auth role on insert.
-- Every player is a 'member'; Llamanat3r is the sole organizer/admin.
INSERT INTO public.profiles (id, display_name, bio, created_at, updated_at, profile_id, avatar_url, user_id, link_id, role) VALUES
  ('ada5319e-3a88-4b3d-9f33-d7d5704932d5', 'matt_the_grey',
   'Wolf tyrant, lord of the league. Might as well give me the trophy now.',
   '2026-02-23 19:04:12.57807+00', '2026-02-23 22:18:33.721245+00', 4,
   'https://cdn.discordapp.com/avatars/401996909511966720/f93f5b6400a05f3c177c413fb281608d.png',
   'ada5319e-3a88-4b3d-9f33-d7d5704932d5', NULL, 'member'),
  ('285435bd-1657-4b06-988d-b9d06e24ea87', 'palekingwithagun',
   NULL,
   '2026-03-01 07:48:52.667046+00', '2026-03-02 06:06:25.215637+00', 7,
   'https://cdn.discordapp.com/avatars/681947567990243393/c777ad004a9941814e037417c7afa3af.png',
   '1db9658f-4c92-4e25-baf0-9ff4e0024752', NULL, 'member'),
  ('d9f0f8a6-cbfd-40fd-865f-db7013c5cc26', 'KiloBravo',
   'Keith',
   '2026-02-20 20:39:36.598095+00', '2026-03-09 17:51:28.233638+00', 2,
   'https://pbqmepwuxrcnmspnucgh.supabase.co/storage/v1/object/public/avatars/d9f0f8a6-cbfd-40fd-865f-db7013c5cc26/avatar.png?t=1773078686663',
   'd9f0f8a6-cbfd-40fd-865f-db7013c5cc26', NULL, 'member'),
  ('8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2', 'Knight',
   NULL,
   '2026-02-20 20:54:21.43555+00', '2026-03-16 18:55:10.767808+00', 3,
   NULL,
   '8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2', NULL, 'member'),
  ('65e306b2-67f8-4fe1-97c6-53b833cf66ad', 'grand_cappuccino_pptx',
   NULL,
   '2026-02-26 16:20:43.691897+00', '2026-04-23 03:16:11.296453+00', 6,
   'https://cdn.discordapp.com/avatars/676558929731256320/a55e8ae8ca87bfed4af0fe0efd2ace5e.png',
   '0662f84a-76a1-4421-b068-c05d458386f5', '676558929731256320', 'member'),
  ('733f6fc6-bb3b-4be5-8840-39d20404896d', 'Llamanat3r',
   'What start as painting models a few models for a friend, has now turn into purging heretics off the table with flamers and meltas. The Emperor''s light shall guide our fight!',
   '2026-02-18 16:45:11.71439+00', '2026-07-13 02:38:24.620165+00', 1,
   'https://pbqmepwuxrcnmspnucgh.supabase.co/storage/v1/object/public/avatars/733f6fc6-bb3b-4be5-8840-39d20404896d/avatar.png?t=1771540017280',
   '733f6fc6-bb3b-4be5-8840-39d20404896d', NULL, 'organizer'),
  ('ce9bf524-9aa6-4e75-b2ba-012e774dc163', 'shield0109',
   NULL,
   '2026-07-13 02:46:34.316795+00', '2026-07-13 02:46:34.316795+00', 8,
   'https://cdn.discordapp.com/avatars/394251796778057738/b60350ab5a066bf758091feb9dec7fc5.png',
   '7e98517a-3901-4aa9-837e-fac6c793f9b1', NULL, 'member'),
  ('a3405965-5de0-42cb-8564-1db680409dc2', 'bluesnoweyes',
   'Been collecting since 2006 and playing since 2013. I have a ton of factions, but space bugs live rent free in my heart <3',
   '2026-02-23 22:29:43.330905+00', '2026-07-13 17:05:37.942618+00', 5,
   'https://cdn.discordapp.com/avatars/342910035489193985/9fda761d08b5f8af80f0dad6ecdea0b5.png',
   'cd361275-f0db-4511-9043-3c1402ae24a1', '342910035489193985', 'member')
ON CONFLICT (id) DO NOTHING;

SELECT setval('profiles_profile_id_seq', (SELECT COALESCE(MAX(profile_id), 1) FROM public.profiles));

-- ============================================================================
-- Auth Roles
-- ============================================================================
-- The handle_new_profile_role trigger already assigned role_id=1 ('user') to
-- every profile above. Only Llamanat3r is elevated to admin.
INSERT INTO public.user_roles (user_id, role_id) VALUES
  ('733f6fc6-bb3b-4be5-8840-39d20404896d', 3)  -- Llamanat3r: admin
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- Profile Factions (lookup by name — sub-faction UUIDs are generated per-env)
-- ============================================================================
INSERT INTO public.profile_factions (profile_id, faction_id)
SELECT p.id, f.id FROM (VALUES
  ('matt_the_grey', 'Space Wolves'),
  ('grand_cappuccino_pptx', 'World Eaters'),
  ('grand_cappuccino_pptx', 'Grey Knights'),
  ('grand_cappuccino_pptx', 'Necrons'),
  ('palekingwithagun', 'Death Guard'),
  ('KiloBravo', 'World Eaters'),
  ('KiloBravo', 'Imperial Knights'),
  ('Knight', 'Chaos Space Marines'),
  ('Knight', 'Dark Angels'),
  ('Llamanat3r', 'Adepta Sororitas'),
  ('Llamanat3r', 'Black Templars'),
  ('bluesnoweyes', 'Tyranids'),
  ('bluesnoweyes', 'Chaos Daemons'),
  ('bluesnoweyes', 'Chaos Space Marines'),
  ('bluesnoweyes', 'Death Guard'),
  ('bluesnoweyes', 'Thousand Sons'),
  ('bluesnoweyes', 'Dark Angels'),
  ('bluesnoweyes', 'Astra Militarum'),
  ('bluesnoweyes', 'Drukhari'),
  ('bluesnoweyes', 'Leagues of Votann')
) AS v(display_name, faction_name)
JOIN public.profiles p ON p.display_name = v.display_name
JOIN public.factions f ON f.name = v.faction_name
ON CONFLICT (profile_id, faction_id) DO NOTHING;

-- ============================================================================
-- Seasons
-- ============================================================================
-- battle_points_id: 5 = Strike Force (2000)
INSERT INTO public.seasons (id, number, name, start_date, end_date, battle_points_id, description, rules, status, created_at, updated_at) VALUES
  (1, 1, 'The Crusade Begins',
   '2026-03-01', '2026-05-31', 5,
   'War has come to the Segmentum Pacificus. As ancient rivalries reignite and new threats emerge from the void, warlords marshal their forces for dominance. The Grimdark League opens its first campaign — a brutal proving ground where commanders will forge their legacies in blood and fire. Every battle shapes the standings. Every victory echoes across the sector. There is no peace amongst the stars. Only war. Welcome to the Crusade.',
   E'Season Rules\n- Round Robin style, each player will play each other player.\n- No Challenge or Twist Cards\n- Games are to played at Strike Force (2000 pts) points.\n    - If an opponent is only able to play at Strike Force, the game will be played at Incursion (1000 pts) points. \n\nFaction Rules\n1. You must stay with the same faction through out the season.\n2. You can change Army list between games. \n\nGame Setup Rules\n1. Set up Terrain.\n2. Set up Objective Markers.\n3. Draw Mission card and layout deployment zones. \n4. Role, Winner decides if they are Attacker or Defender.\n    - Defender will deploy first.\n5. Role, Winner decided who goes first.',
   'published', '2026-02-25 23:31:15.626237+00', '2026-03-02 06:17:23.827778+00')
ON CONFLICT (id) DO NOTHING;

SELECT setval('seasons_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.seasons));

-- ============================================================================
-- Season Rosters (faction lookup by name)
-- ============================================================================
INSERT INTO public.season_roster (season_id, profile_id, faction_id, joined_at)
SELECT 1, p.id, f.id, v.joined_at::timestamptz
FROM (VALUES
  ('matt_the_grey', 'Space Wolves', '2026-02-28 06:06:18.073375+00'),
  ('Llamanat3r', 'Adepta Sororitas', '2026-02-28 06:06:24.832467+00'),
  ('KiloBravo', 'World Eaters', '2026-02-28 06:06:34.099904+00'),
  ('Knight', 'Chaos Space Marines', '2026-02-28 06:07:28.427623+00'),
  ('bluesnoweyes', 'Tyranids', '2026-02-28 06:07:33.244297+00'),
  ('grand_cappuccino_pptx', 'Necrons', '2026-03-01 15:29:08.455364+00'),
  ('palekingwithagun', 'Death Guard', '2026-03-02 06:16:55.146262+00')
) AS v(display_name, faction_name, joined_at)
JOIN public.profiles p ON p.display_name = v.display_name
JOIN public.factions f ON f.name = v.faction_name
ON CONFLICT (season_id, profile_id) DO NOTHING;

-- ============================================================================
-- Battle Reports (faction lookup by name; profile UUIDs are stable)
-- ============================================================================

-- Report 1: matt_the_grey (Space Wolves) wins vs Llamanat3r (Adepta Sororitas)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT '0b3a68cd-1b1f-417f-8409-ef73f345eb6e'::uuid,
  '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid, af.id, 13, 'loss',
  'ada5319e-3a88-4b3d-9f33-d7d5704932d5'::uuid, df.id, 14, 'win',
  8, 2, 5, 3, '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid,
  '2026-02-23 22:21:38.003388+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-02-21'::date, NULL, 'published',
  false, false, 0, 0, 0, 0, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Adepta Sororitas' AND df.name = 'Space Wolves'
ON CONFLICT (id) DO NOTHING;

-- Report 2: bluesnoweyes (Tyranids) wins vs KiloBravo (World Eaters)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT '17b23078-b91b-4d5f-99f7-292b3d249156'::uuid,
  'a3405965-5de0-42cb-8564-1db680409dc2'::uuid, af.id, 33, 'win',
  'd9f0f8a6-cbfd-40fd-865f-db7013c5cc26'::uuid, df.id, 29, 'loss',
  7, 2, 5, 3, 'd9f0f8a6-cbfd-40fd-865f-db7013c5cc26'::uuid,
  '2026-02-23 23:08:52.499955+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-02-21'::date, NULL, 'published',
  false, false, 0, 0, 0, 0, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Tyranids' AND df.name = 'World Eaters'
ON CONFLICT (id) DO NOTHING;

-- Report 3: bluesnoweyes (Tyranids) wins vs palekingwithagun (Death Guard)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT '45d0eb7e-b9d7-40ef-a233-54956e440eec'::uuid,
  'a3405965-5de0-42cb-8564-1db680409dc2'::uuid, af.id, 84, 'win',
  '285435bd-1657-4b06-988d-b9d06e24ea87'::uuid, df.id, 62, 'loss',
  4, 1, 5, 5, 'a3405965-5de0-42cb-8564-1db680409dc2'::uuid,
  '2026-03-02 14:11:08.181907+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-03-01'::date, 1, 'published',
  false, false, 0, 0, 0, 0, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Tyranids' AND df.name = 'Death Guard'
ON CONFLICT (id) DO NOTHING;

-- Report 4: grand_cappuccino_pptx (Necrons) wins vs Llamanat3r (Adepta Sororitas)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT 'b4cfdcb8-3c4c-4b4e-8866-5b604c95d52c'::uuid,
  '65e306b2-67f8-4fe1-97c6-53b833cf66ad'::uuid, af.id, 19, 'win',
  '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid, df.id, 4, 'loss',
  4, 3, 5, 1, '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid,
  '2026-03-01 23:01:24.782919+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-03-01'::date, NULL, 'published',
  false, false, 0, 7, 2, 10, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Necrons' AND df.name = 'Adepta Sororitas'
ON CONFLICT (id) DO NOTHING;

-- Report 5: matt_the_grey (Space Wolves) wins vs Llamanat3r (Adepta Sororitas)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT '5ddb725f-11ac-4480-b619-89a9579f351e'::uuid,
  'ada5319e-3a88-4b3d-9f33-d7d5704932d5'::uuid, af.id, 92, 'win',
  '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid, df.id, 15, 'loss',
  8, 1, 5, 5, '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid,
  '2026-03-14 03:51:51.849095+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-03-13'::date, 1, 'published',
  false, false, 0, 0, 0, 0, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Space Wolves' AND df.name = 'Adepta Sororitas'
ON CONFLICT (id) DO NOTHING;

-- Report 6: KiloBravo (World Eaters) wins vs bluesnoweyes (Tyranids) — defender reported
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT 'f7834102-3f88-4a77-84a4-b7c654463918'::uuid,
  'a3405965-5de0-42cb-8564-1db680409dc2'::uuid, af.id, 65, 'loss',
  'd9f0f8a6-cbfd-40fd-865f-db7013c5cc26'::uuid, df.id, 69, 'win',
  1, 5, 5, 5, 'a3405965-5de0-42cb-8564-1db680409dc2'::uuid,
  '2026-03-17 03:12:13.625836+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-03-13'::date, 1, 'published',
  false, false, 14, 45, 0, 0, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Tyranids' AND df.name = 'World Eaters'
ON CONFLICT (id) DO NOTHING;

-- Report 7: Knight (Dark Angels) wins vs bluesnoweyes (Tyranids)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT 'e8694a9a-1f87-4214-93b9-e231c44abfb4'::uuid,
  'a3405965-5de0-42cb-8564-1db680409dc2'::uuid, af.id, 37, 'loss',
  '8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2'::uuid, df.id, 58, 'win',
  5, 5, 3, 4, '8ac5f8d2-1f4f-42e0-b9f4-b8eb5f252fe2'::uuid,
  '2026-03-29 01:15:08.203319+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-03-28'::date, 1, 'published',
  false, false, 5, 14, 2, 18, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Tyranids' AND df.name = 'Dark Angels'
ON CONFLICT (id) DO NOTHING;

-- Report 8: grand_cappuccino_pptx (Necrons) wins vs palekingwithagun (Death Guard)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT 'd39edc6e-33bc-47b6-973b-445aa8826f18'::uuid,
  '65e306b2-67f8-4fe1-97c6-53b833cf66ad'::uuid, af.id, 20, 'win',
  '285435bd-1657-4b06-988d-b9d06e24ea87'::uuid, df.id, 10, 'loss',
  3, 4, 5, 2, '65e306b2-67f8-4fe1-97c6-53b833cf66ad'::uuid,
  '2026-04-23 03:20:25.286705+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-04-22'::date, 1, 'published',
  false, false, 1, 2, 4, 15, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Necrons' AND df.name = 'Death Guard'
ON CONFLICT (id) DO NOTHING;

-- Report 9: bluesnoweyes (Tyranids) wins vs Llamanat3r (Adepta Sororitas)
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT '528feeb3-41de-4215-9522-0116292ed6ac'::uuid,
  'a3405965-5de0-42cb-8564-1db680409dc2'::uuid, af.id, 53, 'win',
  '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid, df.id, 19, 'loss',
  2, 6, 5, 4, 'a3405965-5de0-42cb-8564-1db680409dc2'::uuid,
  '2026-05-04 16:24:02.04472+00'::timestamptz, '2026-07-05 15:32:21.059676+00'::timestamptz, '2026-05-01'::date, 1, 'published',
  false, false, 4, 40, 7, 35, 1, NULL, NULL, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Tyranids' AND df.name = 'Adepta Sororitas'
ON CONFLICT (id) DO NOTHING;

-- Report 10: Llamanat3r (Black Templars) wins vs bluesnoweyes (Leagues of Votann) — 11th edition
INSERT INTO public.battle_reports (
  id, attacker_id, attacker_faction_id, attacker_score, attacker_outcome,
  defender_id, defender_faction_id, defender_score, defender_outcome,
  mission_id, deployment_id, battle_points_id, rounds, reported_by,
  created_at, updated_at, event_date, season_id, status,
  attacker_tabled, defender_tabled, attacker_units_lost, attacker_models_lost,
  defender_units_lost, defender_models_lost, edition_id,
  attacker_force_disposition_id, defender_force_disposition_id,
  attacker_secondary_mode, defender_secondary_mode
)
SELECT '266dd2b2-9752-4d28-812a-199f432c44cb'::uuid,
  '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid, af.id, 27, 'win',
  'a3405965-5de0-42cb-8564-1db680409dc2'::uuid, df.id, 18, 'loss',
  NULL, 10, 1, 3, '733f6fc6-bb3b-4be5-8840-39d20404896d'::uuid,
  '2026-07-13 02:35:24.861445+00'::timestamptz, '2026-07-13 17:06:08.178893+00'::timestamptz, '2026-07-11'::date, NULL, 'published',
  false, false, 0, 0, 0, 0, 2, 1, 1, NULL, NULL
FROM public.factions af, public.factions df
WHERE af.name = 'Black Templars' AND df.name = 'Leagues of Votann'
ON CONFLICT (id) DO NOTHING;
