# Profile Picture

**Epic:** Member Profiles
**Status:** In Progress

## Summary

Display the member's profile picture (avatar) on their profile page. The avatar is sourced from their OAuth provider (e.g., Discord, Google) and stored in the `avatar_url` column on the `profiles` table. The avatar syncs automatically on sign-in via a database trigger, but is never overwritten if the user has set a custom avatar.

## Acceptance Criteria

- [x] `avatar_url` column exists on the `profiles` table
- [x] Avatar is automatically populated from the OAuth provider on profile creation
- [x] User-set avatars are not overwritten by the provider sync
- [ ] Profile page displays the member's avatar image
- [ ] A fallback placeholder is shown when no avatar is available
- [ ] Avatar is displayed on the member directory listing (when implemented)

## Database

### Migration: `supabase/migrations/20260219143624_add_avatar_url_to_profiles.sql`

- Adds `avatar_url` (text, nullable) column to `profiles`
- Creates `sync_avatar_from_provider()` trigger function that copies `raw_user_meta_data->>'avatar_url'` from `auth.users` into `profiles.avatar_url` on insert/update — only when `avatar_url` is null

## Implementation Notes

### Avatar Display

- Use a Next.js `<Image>` component or standard `<img>` with appropriate sizing
- Display as a rounded/circular image on the profile page
- Provide a fallback (e.g., user initials or a default icon) when `avatar_url` is null

### Security

- `avatar_url` is readable by any authenticated user via existing RLS SELECT policy
- Only the profile owner can update their own `avatar_url` via existing RLS UPDATE policy
