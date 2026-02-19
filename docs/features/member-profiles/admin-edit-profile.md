# Admin Edit Profile

**Epic:** Member Profiles
**Status:** Todo

## Summary

Allow administrators to edit any member's profile. Admins can access a member's edit form from their profile page and update their display name, bio, and faction selections. All changes are subject to the same validation rules as self-editing. Admin access is enforced server-side via role checks.

## Acceptance Criteria

- [ ] Admins can navigate to an edit form for any member's profile
- [ ] The member's profile page shows an "Edit Profile" link to admins (not just the profile owner)
- [ ] Admins can update a member's display name, bio, and faction selections
- [ ] The same validation rules apply (display name format, uniqueness, bio length, faction UUID format)
- [ ] Non-admin users cannot access or submit the admin edit form (server-side role check)
- [ ] RLS policies allow admins to update other users' profiles and faction associations
- [ ] Changes are saved to the database and reflected immediately
- [ ] An audit trail or log entry is created when an admin edits another user's profile

## Proposed Implementation

### Route

`/admin/profile/[profileId]/edit` — admin-only route for editing any member's profile.

### Page (`page.tsx`)

- Server component that verifies the current user has the `admin` role via `hasRole(userId, 'admin')`
- Redirects non-admins to `/`
- Fetches the target profile by `profileId` param
- Fetches factions and the target user's selected faction IDs in parallel
- Passes all data to an edit form component

### Form Component

- Reuses the same form structure as `edit-profile-form.tsx` or extracts a shared form component
- Accepts the target profile, factions, and selected faction IDs as props
- Submits to an admin-specific server action

### Server Action

- Verifies the caller has the `admin` role before processing
- Reads and validates display name, bio, and faction IDs from FormData
- Updates the target user's profile (not the caller's)
- Clear-and-replaces faction associations for the target user
- Returns success/error state

### RLS Policy Changes

- Add an UPDATE policy on `profiles` allowing admins to update any row:
  ```sql
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
  ```
- Add INSERT and DELETE policies on `profile_factions` allowing admins to manage any user's faction associations

### Profile Page Changes

- Update `src/app/profile/[profileId]/page.tsx` to check if the current user is an admin
- If admin and not the profile owner, show an "Edit Profile" link pointing to `/admin/profile/[profileId]/edit`

### Middleware

- Extend middleware to protect `/admin/*` routes, requiring the `admin` role

## Key Design Decisions

- **Separate admin route** — uses `/admin/profile/[profileId]/edit` rather than overloading `/profile/edit` to keep admin and user flows distinct
- **Server-side role enforcement** — admin status is checked in the server action and page component, never trusted from the client
- **Same validation rules** — admins are subject to the same validation constraints as regular users to maintain data integrity
- **Audit logging** — admin edits to other profiles should be logged for accountability (can start with `console.log` and move to a database audit table later)
