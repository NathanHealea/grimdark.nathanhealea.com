-- Create sequence for profile_id
create sequence public.profiles_profile_id_seq;

-- Add profile_id column (nullable initially to allow backfill)
alter table public.profiles
  add column profile_id integer unique default nextval('public.profiles_profile_id_seq');

-- Backfill existing rows that have no profile_id
update public.profiles
  set profile_id = nextval('public.profiles_profile_id_seq')
  where profile_id is null;

-- Now enforce not null
alter table public.profiles alter column profile_id set not null;

-- Bind sequence ownership to the column
alter sequence public.profiles_profile_id_seq owned by public.profiles.profile_id;
