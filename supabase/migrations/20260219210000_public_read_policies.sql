create policy "Profiles are publicly readable" on public.profiles for select to anon using (true);
create policy "Factions are publicly readable" on public.factions for select to anon using (true);
create policy "Profile factions are publicly readable" on public.profile_factions for select to anon using (true);
