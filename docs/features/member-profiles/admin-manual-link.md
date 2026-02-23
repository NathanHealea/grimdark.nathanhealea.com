# Admin Manual Link

**Epic:** Member Profiles
**Status:** Todo

## Summary

Allow administrators to manually link an existing auth account to an unlinked profile through the admin edit page. Currently admins can only unlink profiles or set a `link_id` for auto-linking on Discord sign-in. This feature adds the ability to directly associate a specific auth user with a profile, completing the admin linking workflow.

## Acceptance Criteria

- [ ] The admin edit profile page shows a "Link Account" section when the profile is unlinked
- [ ] Admins can search for or select an unlinked auth user (one without a profile) to link
- [ ] Linking associates the selected auth user with the profile (`profiles.user_id = auth_uuid`)
- [ ] Linking automatically assigns the `user` auth role to the linked account
- [ ] Validation prevents linking to an auth user that already has a profile
- [ ] Validation prevents linking a profile that is already linked
- [ ] The page refreshes to show the updated link status after a successful link
- [ ] Non-admin users cannot invoke the link action (server-side role check)
- [ ] The existing "Unlink" button continues to work for linked profiles

## Routes

No new routes. The feature extends the existing admin edit page.

| Route | Description |
|---|---|
| `/admin/user-management/[profileId]/edit` | Modified — adds manual link UI for unlinked profiles |

## Database

No new migrations. The existing `link_profile(profile_uuid, auth_uuid)` SQL function handles the linking logic (validates both sides, updates `user_id`, assigns `user` role).

### New Query: Unlinked Auth Users

A server-side query to fetch auth users who do not yet have a profile:

```sql
SELECT u.id, u.email
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
ORDER BY u.email;
```

This requires using the Supabase admin client (service role) since `auth.users` is not accessible via the standard client.

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/admin/user-management/[profileId]/edit/page.tsx` | Fetch unlinked auth users, pass to form |
| Modify | `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx` | Add link account UI in Link Status section |
| Modify | `src/app/admin/user-management/[profileId]/edit/actions.ts` | Add `linkProfileAction` server action |
| Create | `src/lib/supabase/admin.ts` | Admin client helper for auth.users queries |

### Approach

#### 1. Admin Supabase Client

Create a server-side admin client using the service role key to query `auth.users`. This is needed because the standard client cannot access the `auth` schema.

```ts
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

#### 2. Fetch Unlinked Auth Users

In the admin edit page server component, when the profile is unlinked, fetch all auth users that don't have a linked profile. Pass the list to the form component.

#### 3. Link Account UI

In the Link Status section of the admin edit form, when the profile is unlinked:

- Show a select dropdown of available auth users (email displayed)
- "Link Account" button calls `linkProfileAction`
- On success, the page revalidates and shows the linked state

#### 4. Server Action

```ts
linkProfileAction(prevState, formData) → ProfileFormState
```

1. Verify caller is admin
2. Extract `profile_id` and `auth_user_id` from form data
3. Call `supabase.rpc('link_profile', { profile_uuid, auth_uuid })`
4. Revalidate path on success
5. Return success/error state

## Key Design Decisions

1. **Use existing `link_profile()` RPC** — The SQL function already handles validation (profile must be unlinked, auth user must not have a profile) and assigns the `user` role. No new database logic needed.

2. **Service role client for auth.users** — Standard Supabase clients cannot query `auth.users`. Using a service role client server-side is the standard Supabase pattern for admin operations on auth data.

3. **Select dropdown over text input** — Showing a dropdown of available auth users is safer than typing a UUID. It prevents typos and makes it clear which accounts are available for linking.

## Notes

- Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (already available from `npx supabase status` output as the "Secret" key).
- This feature complements the existing auto-link (via `link_id` on Discord sign-in) and unlink workflows.
