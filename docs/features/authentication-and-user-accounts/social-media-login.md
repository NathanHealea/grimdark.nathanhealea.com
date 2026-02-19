# Social Media Login (Google & Discord)

**Epic:** Authentication & User Accounts
**Status:** Todo

## Summary

Allow users to sign in or sign up using their Google or Discord accounts via Supabase OAuth, in addition to the existing email/password flow.

## Acceptance Criteria

- [ ] Users can sign in/sign up with Google
- [ ] Users can sign in/sign up with Discord
- [ ] OAuth users are redirected through `/auth/callback` and session is established
- [ ] New OAuth users are redirected to `/profile/setup` (existing middleware handles this)
- [ ] Existing OAuth users bypass setup and go to `/`
- [ ] OAuth buttons appear on both sign-in and sign-up pages
- [ ] Email/password login continues to work alongside OAuth
- [ ] `avatar_url` column added to `profiles` table (nullable text)
- [ ] On OAuth sign-in/sign-up, if `avatar_url` is null, populate it from the provider's profile picture via a Supabase database trigger
- [ ] Profile setup page pre-fills display name from OAuth provider metadata (`full_name`, `name`, or `custom_username`)
- [ ] If the suggested display name is already taken, a warning is shown on the profile setup page

## Routes

No new routes required — reuses existing `/auth/callback`.

## Key Files

| File | Role |
|---|---|
| `src/app/(auth)/sign-in/page.tsx` | Add Google and Discord OAuth buttons |
| `src/app/(auth)/sign-up/page.tsx` | Add Google and Discord OAuth buttons |
| `src/app/(auth)/actions.ts` | Add `signInWithGoogle()` and `signInWithDiscord()` server actions |
| `src/app/auth/callback/route.ts` | Existing — handles code exchange for OAuth redirect |
| `supabase/config.toml` | Enable Google and Discord providers |
| `supabase/migrations/XXXXXX_add_avatar_url_to_profiles.sql` | Add `avatar_url` column and trigger to sync from OAuth provider |
| `src/types/profile.ts` | Add `avatar_url` field to `Profile` type |
| `src/app/profile/setup/page.tsx` | Fetch OAuth display name from user metadata, check uniqueness |
| `src/app/profile/setup/profile-form.tsx` | Accept `suggestedName` and `nameAlreadyTaken` props, pre-fill input and show warning |

## Approach

### 1. Enable OAuth providers in Supabase

Update `supabase/config.toml` to enable Google and Discord:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"

[auth.external.discord]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_DISCORD_SECRET)"
```

### 2. Add environment variables

Add OAuth client IDs and secrets to `.env.local` for local development and to the production Supabase project settings.

### 3. Add `avatar_url` column to profiles

Create a new migration that adds the column and a database function/trigger to sync the avatar from the OAuth provider:

```sql
-- Add avatar_url column
alter table public.profiles
  add column avatar_url text;

-- Function: sync avatar from OAuth provider on sign-in/sign-up
-- Supabase stores the provider's profile picture in auth.users.raw_user_meta_data->>'avatar_url'
-- This trigger fires on profile insert or update and populates avatar_url if it is null
create or replace function public.sync_avatar_from_provider()
returns trigger as $$
declare
  provider_avatar text;
begin
  -- Only fill in avatar_url if the profile doesn't already have one
  if new.avatar_url is not null then
    return new;
  end if;

  -- Look up the provider's avatar from auth.users metadata
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
```

Supabase Auth stores the provider's profile picture URL in `auth.users.raw_user_meta_data->>'avatar_url'` for both Google and Discord. The trigger runs on every profile insert (setup) and update (edit), but only writes when `avatar_url` is null — so a user-uploaded avatar is never overwritten.

### 4. Update Profile type

Add `avatar_url` to the TypeScript type in `src/types/profile.ts`:

```ts
export type Profile = {
  id: string
  profile_id: number
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}
```

### 5. Create OAuth server actions

Add two server actions to `src/app/(auth)/actions.ts`:

- `signInWithGoogle()` — calls `supabase.auth.signInWithOAuth({ provider: 'google' })` with a redirect URL pointing to `/auth/callback`
- `signInWithDiscord()` — calls `supabase.auth.signInWithOAuth({ provider: 'discord' })` with a redirect URL pointing to `/auth/callback`

Both actions receive the OAuth redirect URL from Supabase and redirect the browser to the provider's consent screen.

### 6. Add OAuth buttons to sign-in and sign-up pages

Add "Continue with Google" and "Continue with Discord" buttons to both pages, separated from the email/password form by a divider. Each button submits a form that calls the corresponding server action.

### 7. Pre-fill display name on profile setup

When an OAuth user lands on `/profile/setup`, the setup page reads the user's metadata from `auth.users.user_metadata` (fields: `full_name`, `name`, or `custom_username`) and passes it to the form as `suggestedName`. The page also checks if that name is already taken (`ilike` query on `profiles.display_name`) and passes `nameAlreadyTaken` to the form.

The form pre-fills the display name input via `defaultValue` and shows a warning alert if the name is taken, prompting the user to choose a different one. Email/password users (who have no metadata) see an empty input as before.

### 8. Reuse existing auth callback

The existing `/auth/callback` route handler already exchanges the authorization code for a session and redirects. No changes needed — it works for both email confirmation and OAuth flows.

## Key Design Decisions

- **Server actions for OAuth** — `signInWithOAuth()` returns a redirect URL. The server action performs the redirect, keeping the flow server-side.
- **Avatar sync via database trigger** — A `BEFORE INSERT OR UPDATE` trigger on `profiles` checks `auth.users.raw_user_meta_data->>'avatar_url'` and populates `avatar_url` only when it is null. This keeps the logic in Supabase (no app-side code needed) and never overwrites a user-set avatar. Uses `security definer` to read from `auth.users`.
- **Existing middleware handles new OAuth users** — Supabase Auth creates the user in `auth.users` automatically. The middleware detects the missing profile and redirects to `/profile/setup`.
- **Provider branding** — Google and Discord buttons use recognizable brand colors to build trust with users.
- **Shared callback route** — Both email confirmation and OAuth use `/auth/callback`, reducing code duplication.
- **Display name pre-fill** — The setup page reads the provider's display name from `user_metadata` (server-side) and passes it as a prop. A case-insensitive uniqueness check runs at page load so the warning appears immediately, not after form submission.

## Notes

- **Google OAuth** requires a [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials. Authorized redirect URI: `https://<supabase-project>.supabase.co/auth/v1/callback`.
- **Discord OAuth** requires a [Discord Developer Application](https://discord.com/developers/applications). Redirect URI: `https://<supabase-project>.supabase.co/auth/v1/callback`.
- For local development, redirect URIs must include `http://localhost:54321/auth/v1/callback` (Supabase local auth server).
- Production redirect URI is configured in the Supabase dashboard under Authentication > URL Configuration.
