-- Add avatar_url column to profiles
alter table public.profiles
  add column avatar_url text;

-- Function: sync avatar from OAuth provider on profile insert/update
-- Supabase stores the provider's profile picture in auth.users.raw_user_meta_data->>'avatar_url'
-- Only populates avatar_url when it is null, so user-set avatars are never overwritten
create or replace function public.sync_avatar_from_provider()
returns trigger as $$
declare
  provider_avatar text;
begin
  if new.avatar_url is not null then
    return new;
  end if;

  select raw_user_meta_data->>'avatar_url'
    into provider_avatar
    from auth.users
    where id = new.id;

  if provider_avatar is not null and provider_avatar <> '' then
    new.avatar_url := provider_avatar;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_sync_avatar
  before insert or update on public.profiles
  for each row
  execute function public.sync_avatar_from_provider();
