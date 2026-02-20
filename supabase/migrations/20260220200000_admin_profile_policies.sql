-- ============================================================
-- Migration: Admin profile management RLS policies
-- Feature: Admin Edit Profile
-- ============================================================

-- Admins can update any profile
create policy "Admins can update any profile"
  on public.profiles
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- Admins can insert profile factions for any user
create policy "Admins can insert profile factions for any user"
  on public.profile_factions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- Admins can delete profile factions for any user
create policy "Admins can delete profile factions for any user"
  on public.profile_factions
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- Admins can upload avatars for any user
create policy "Admins can upload avatar for any user"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- Admins can update (overwrite) avatars for any user
create policy "Admins can update avatar for any user"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );
