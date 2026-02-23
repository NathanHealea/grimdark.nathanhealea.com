-- ============================================================
-- Migration: Unlinked Profiles
-- Decouples profiles from auth.users, adds user_id/link_id/role
-- ============================================================

-- 1. Schema changes to profiles
-- ============================================================

-- Drop FK from profiles.id → auth.users (keep id as PK)
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add user_id (links to auth account), link_id (for auto-linking), role (league role)
ALTER TABLE public.profiles ADD COLUMN user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN link_id text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN role text NOT NULL DEFAULT 'member'
  CHECK (role IN ('member', 'organizer'));

-- Backfill user_id for existing profiles (id currently equals auth UUID)
UPDATE public.profiles SET user_id = id;

-- 2. Migrate user_roles FK from profiles to auth.users
-- ============================================================

-- Drop existing FK on user_roles.user_id → profiles(id)
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;

-- Add new FK to auth.users (existing data already contains auth UUIDs)
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remove 'member' role from roles table (now tracked via profiles.role)
DELETE FROM public.user_roles WHERE role_id = (SELECT id FROM public.roles WHERE name = 'member');
DELETE FROM public.roles WHERE name = 'member';

-- 3. Update trigger: role assignment on profile creation
-- ============================================================

-- Only assign 'user' auth role when profile has a linked auth user
CREATE OR REPLACE FUNCTION public.handle_new_profile_role()
RETURNS trigger AS $$
BEGIN
  IF new.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT new.user_id, r.id FROM public.roles r WHERE r.name = 'user';
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update trigger: avatar sync
-- ============================================================

-- Use user_id instead of id for looking up auth.users provider data
CREATE OR REPLACE FUNCTION public.sync_avatar_from_provider()
RETURNS trigger AS $$
DECLARE provider_avatar text;
BEGIN
  IF new.avatar_url IS NOT NULL OR new.user_id IS NULL THEN RETURN new; END IF;
  SELECT raw_user_meta_data->>'avatar_url' INTO provider_avatar
    FROM auth.users WHERE id = new.user_id;
  IF provider_avatar IS NOT NULL AND provider_avatar <> '' THEN
    new.avatar_url := provider_avatar;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update RLS policies on profiles
-- ============================================================

-- Drop old self-insert/self-update policies (they reference auth.uid() = id)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with user_id check
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can insert profiles (for creating unlinked profiles)
CREATE POLICY "Admins can insert any profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- 6. Update RLS policies on profile_factions
-- ============================================================

-- Drop old self-insert/self-delete policies (they check auth.uid() = profile_id)
DROP POLICY IF EXISTS "Users can insert their own profile factions" ON public.profile_factions;
DROP POLICY IF EXISTS "Users can delete their own profile factions" ON public.profile_factions;

-- Recreate with user_id lookup
-- Note: must qualify profile_factions.profile_id to avoid ambiguity with profiles.profile_id (integer)
CREATE POLICY "Users can insert their own profile factions"
  ON public.profile_factions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_factions.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own profile factions"
  ON public.profile_factions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_factions.profile_id AND p.user_id = auth.uid()
    )
  );

-- 7. Update RLS policies on battle_reports
-- ============================================================

-- Drop old insert/update policies
DROP POLICY IF EXISTS "Members and admins can submit battle reports" ON public.battle_reports;
DROP POLICY IF EXISTS "Reporter or admin can update battle reports" ON public.battle_reports;

-- Members/organizers (by profile role) can insert, reported_by must be their profile
CREATE POLICY "Members and admins can submit battle reports"
  ON public.battle_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reported_by
        AND p.user_id = auth.uid()
        AND p.role IN ('member', 'organizer')
    )
    OR 'admin' = ANY(public.get_user_roles(auth.uid()))
  );

-- Reporter (via profile) or admin can update
CREATE POLICY "Reporter or admin can update battle reports"
  ON public.battle_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reported_by AND p.user_id = auth.uid()
    )
    OR 'admin' = ANY(public.get_user_roles(auth.uid()))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reported_by AND p.user_id = auth.uid()
    )
    OR 'admin' = ANY(public.get_user_roles(auth.uid()))
  );

-- 8. link_profile() and unlink_profile() functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.link_profile(profile_uuid UUID, auth_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Validate profile is unlinked
  IF (SELECT user_id FROM profiles WHERE id = profile_uuid) IS NOT NULL THEN
    RAISE EXCEPTION 'Profile is already linked';
  END IF;
  -- Validate no profile exists for this auth user
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = auth_uuid) THEN
    RAISE EXCEPTION 'Auth user already has a profile';
  END IF;
  -- Link the profile
  UPDATE profiles SET user_id = auth_uuid WHERE id = profile_uuid;
  -- Assign 'user' auth role
  INSERT INTO user_roles (user_id, role_id)
    SELECT auth_uuid, r.id FROM roles r WHERE r.name = 'user'
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.unlink_profile(profile_uuid UUID)
RETURNS void AS $$
DECLARE old_user_id UUID;
BEGIN
  SELECT user_id INTO old_user_id FROM profiles WHERE id = profile_uuid;
  IF old_user_id IS NULL THEN RAISE EXCEPTION 'Profile is not linked'; END IF;
  -- Remove auth roles for this user
  DELETE FROM user_roles WHERE user_id = old_user_id;
  -- Unlink
  UPDATE profiles SET user_id = NULL WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
