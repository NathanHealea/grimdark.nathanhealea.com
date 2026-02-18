-- Create profile_factions join table
create table public.profile_factions (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  faction_id uuid not null references public.factions(id) on delete cascade,
  primary key (profile_id, faction_id)
);

-- Enable Row Level Security
alter table public.profile_factions enable row level security;

-- Policy: Authenticated users can read all profile-faction associations
create policy "Profile factions are viewable by authenticated users"
  on public.profile_factions
  for select
  to authenticated
  using (true);

-- Policy: Users can add their own faction associations
create policy "Users can insert their own profile factions"
  on public.profile_factions
  for insert
  to authenticated
  with check (auth.uid() = profile_id);

-- Policy: Users can remove their own faction associations
create policy "Users can delete their own profile factions"
  on public.profile_factions
  for delete
  to authenticated
  using (auth.uid() = profile_id);
