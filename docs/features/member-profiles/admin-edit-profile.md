# Admin Edit Profile

**Epic:** Member Profiles
**Status:** In Progress

## Summary

Provide administrators with a dedicated page to view and edit any member's profile. The page is split into sections: **Profile** (display name, bio, avatar, factions), **Roles** (grant/revoke roles), and an **Admin Actions** section designed to accommodate future administrative operations. All changes use the same validation rules as self-editing. Admin access is enforced server-side via role checks and RLS policies.

## Acceptance Criteria

### Profile Editing

- [ ] Admins can navigate to an edit page for any member's profile
- [ ] The member's profile page shows an "Edit" link/button to admins (not just the profile owner)
- [ ] The user management table "Edit User" action links to this page
- [ ] Admins can update a member's display name, bio, and faction selections
- [ ] Admins can update a member's avatar (upload a new image)
- [ ] The same validation rules apply (display name format, uniqueness, bio length, faction UUID format, image type/size)
- [ ] Non-admin users cannot access or submit the admin edit form (server-side role check)
- [ ] RLS policies allow admins to update other users' profiles and faction associations
- [ ] Changes are saved to the database and reflected immediately

### Role Management

- [ ] The edit page includes a "Roles" section showing the user's current roles
- [ ] Admins can grant or revoke `member` and `admin` roles from this page
- [ ] The `user` role is displayed but cannot be removed
- [ ] Admins cannot modify their own roles (self-modification prevention)
- [ ] Role changes revalidate the page immediately

### Admin Actions

- [ ] The page includes an "Admin Actions" section as a placeholder for future operations
- [ ] The section is extensible — new actions can be added without restructuring the page

## Implementation Plan

### 1. Database Migration — Admin RLS Policies

**File:** `supabase/migrations/XXXXXX_admin_profile_policies.sql`

Add RLS policies so admins can manage any user's profile and faction associations. The admin check uses the same pattern as existing `user_roles` policies.

```sql
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

-- Admins can manage any user's faction associations
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
```

### 2. Admin Edit Profile Page

**File:** `src/app/admin/user-management/[profileId]/edit/page.tsx`

Server component that:

1. Resolves `profileId` param (numeric `profile_id`) to the target user's profile
2. Admin role check is handled by the existing `src/app/admin/layout.tsx` — no additional check needed
3. Fetches in parallel: target profile, factions, target user's selected faction IDs, target user's roles, all assignable roles
4. Passes data to the form component

This route nests under `/admin/user-management/` so the "Edit User" link in the user management table (`/admin/user-management/${u.profile_id}/edit`) works without changes.

### 3. Admin Edit Profile Form

**File:** `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx`

Client component split into collapsible/tabbed sections:

#### Section 1: Profile

Reuses the same form structure as the existing `edit-profile-form.tsx`:

- `ImageUpload` component for avatar (uploads to `avatars/${targetUserId}/avatar.{ext}`)
- Display name input (same validation: 2–50 chars, alphanumeric/hyphens/underscores)
- Bio textarea (same validation: max 500 chars)
- `FactionSelector` component for faction selection
- "Save Changes" button submits to `adminUpdateProfile` server action

#### Section 2: Roles

Inline role management (same UX pattern as user management table):

- Lists current roles as badges
- Protected roles (`user`) shown as ghost badges (not removable)
- Assignable roles shown as removable badges with × button
- "+" dropdown to add available roles
- Uses the existing `toggleRole` action from `src/app/admin/user-management/actions.ts`

#### Section 3: Admin Actions

A placeholder section with a card/container for future admin operations:

- Initially shows "No additional actions available" or a brief description
- Designed as a simple container so new actions (e.g., suspend user, reset password, impersonate) can be added as individual components

### 4. Admin Update Profile Server Action

**File:** `src/app/admin/user-management/[profileId]/edit/actions.ts`

```
adminUpdateProfile(prevState, formData) → ProfileFormState
```

1. Extract `target_user_id` from hidden form field
2. Verify caller is admin via `hasRole(callerId, 'admin')`
3. Validate display name, bio, faction IDs (reuse existing validators from `src/modules/profile/validation.ts`)
4. Check display name uniqueness (excluding the target user's own row)
5. Handle avatar URL if provided (client uploads to storage, passes URL via form data — same pattern as existing edit)
6. Update the target user's profile row (not `auth.uid()` — uses the target user's `id`)
7. Clear-and-replace faction associations for the target user
8. `revalidatePath` on success
9. Return success/error state

### 5. Profile Page — Admin Edit Link

**File:** `src/app/profile/[profileId]/page.tsx`

Update the existing profile view page:

1. Import `hasRole` from `@/lib/supabase/roles`
2. After checking `isOwner`, also check `isAdmin = await hasRole(auth.user.id, 'admin')`
3. If `isAdmin && !isOwner`, show an "Edit Profile" link pointing to `/admin/user-management/${profileId}/edit`
4. If `isOwner`, continue showing the existing self-edit link (`/profile/edit`)

### 6. Avatar Upload for Other Users

The existing `ImageUpload` component and client-side upload pattern work as-is. The key difference:

- The form receives the **target user's ID** (not the admin's) and uses it for the storage path: `avatars/${targetUserId}/avatar.{ext}`
- The admin's Supabase client needs write access to the target user's storage path — may need an RLS policy update on the `avatars` bucket to allow admin uploads

Check if the existing storage policy restricts uploads to `auth.uid()` paths. If so, add a policy allowing admins to upload to any path:

```sql
create policy "Admins can upload avatars for any user"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );
```

Same for update (upsert) on storage.objects.

## Key Files

| File | Role |
|---|---|
| `supabase/migrations/XXXXXX_admin_profile_policies.sql` | RLS policies for admin profile/faction updates |
| `src/app/admin/user-management/[profileId]/edit/page.tsx` | Admin edit profile page (server component) |
| `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx` | Admin edit form (client component with sections) |
| `src/app/admin/user-management/[profileId]/edit/actions.ts` | `adminUpdateProfile` server action |
| `src/app/profile/[profileId]/page.tsx` | Add admin "Edit" link |
| `src/app/admin/user-management/actions.ts` | Existing `toggleRole` action (reused for role section) |
| `src/modules/profile/validation.ts` | Existing validators (reused) |
| `src/components/image-upload.tsx` | Existing avatar upload component (reused) |

## Key Design Decisions

1. **Nested under `/admin/user-management/`** — The edit page lives at `/admin/user-management/[profileId]/edit` rather than `/admin/profile/[profileId]/edit`. This keeps admin routes grouped and means the existing "Edit User" link in the user management table works without changes. The admin layout already protects all `/admin/*` routes.

2. **Sectioned page layout** — The page is divided into Profile, Roles, and Admin Actions sections. Each section is independent and can be updated without affecting the others. This makes the page extensible for future admin features.

3. **Reuse existing components and validators** — The form reuses `ImageUpload`, `FactionSelector`, and all profile validators. The role section reuses the existing `toggleRole` server action. This avoids duplication and keeps behavior consistent.

4. **Separate server action from self-edit** — `adminUpdateProfile` is distinct from the user's `updateProfile` action. The admin action targets a specific user by ID (from a hidden form field) rather than using `auth.uid()`. This keeps the trust boundary clear — the admin action always verifies admin role before processing.

5. **Client-side avatar upload** — Same pattern as self-edit: the client uploads to Supabase Storage and passes the public URL via form data. The server action just stores the URL. This avoids passing large files through the server action.

6. **Self-modification prevention for roles** — Consistent with the existing user management table: admins cannot modify their own roles from any page. The role section is hidden or disabled when viewing your own profile.

7. **Admin Actions section as extension point** — Rather than adding admin operations ad-hoc to various pages, this section provides a single, consistent location for admin-only actions per user. Future operations (suspend, reset password, merge accounts) slot in here.

## Notes

- The middleware already protects `/admin/*` routes — no middleware changes needed.
- The admin layout (`src/app/admin/layout.tsx`) already verifies admin role — no layout changes needed.
- The `toggleRole` action already handles self-modification prevention and protected role checks — no changes needed for the role section.
- Storage bucket policies may need updating if they restrict uploads to `auth.uid()` paths only.
