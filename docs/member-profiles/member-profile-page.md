# Member Profile Page

**Epic:** Member Profiles
**Type:** Feature
**Status:** Completed

## Summary

A profile page for each member displaying their display name and bio. Accessible by any authenticated member via a dynamic route using the member's unique profile ID.

## Acceptance Criteria

- [x] Each member has a unique profile page at `/profile/[profileId]`
- [x] Profile displays display name, bio, and member-since date
- [x] Profile is viewable by any authenticated member
- [x] Viewing your own profile shows an "Edit Profile" link
- [x] A 404 page is shown if the profile ID does not match any member

## Route

`/profile/[profileId]` — Uses the `profile_id` column as the URL slug (e.g., `/profile/42`). The `profile_id` is an auto-incrementing integer assigned by the database on row creation.

## Files to Create

### `src/app/profile/[profileId]/page.tsx` — Profile page (server component)

- Dynamic route parameter: `profileId`
- Fetch the profile by `profile_id` column (exact integer match)
- If no profile found, call `notFound()` to render the 404 page
- Fetch the authenticated user to determine if they are viewing their own profile
- Render a DaisyUI card with:
  - Display name as the heading
  - Bio (or a fallback message if empty)
  - Member since date (formatted from `created_at`)
  - "Edit Profile" link if the viewer is the profile owner

## Files to Modify

### Profile ID Field

The `profile_id` column has been added to the `profiles` table as a prerequisite for this feature.

- **Migration:** `supabase/migrations/20260218190456_add_profile_id.sql` — adds `profile_id` (serial, unique, not null) auto-populated by the database
- **Type:** `profile_id: number` added to `Profile` in `src/types/profile.ts`


### `src/app/page.tsx`

- Add "My Profile" link in the nav for authenticated users (links to `/profile/{profile_id}`)
- Requires fetching the profile with `getAuthUser({ withProfile: true })` instead of just `getAuthUser()`

## Implementation Details

### Profile Lookup

```ts
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('profile_id', profileId)
  .single()
```

### Own Profile Detection

Compare the fetched profile's `id` against the authenticated user's `id` to decide whether to show the "Edit Profile" link.

### Security

- Route is already protected by middleware (not in `PUBLIC_ROUTES`)
- RLS policy allows any authenticated user to SELECT any profile
- No server actions needed — this is a read-only page

### Reuse

- `getAuthUser` from `src/lib/supabase/auth.ts`
- `createClient` from `src/lib/supabase/server.ts`
- `Profile` type from `src/types/profile.ts`
- DaisyUI card pattern from existing setup/edit pages
