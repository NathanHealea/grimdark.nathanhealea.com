# Admin User Management

**Epic:** User Management
**Status:** Completed

## Summary

Provide administrators with a dedicated page to view all users and manage their roles. The system supports N roles — any role added to the `roles` table automatically appears in the UI. Protected roles (e.g. `user`) are displayed but cannot be modified. Admins cannot modify their own roles as a safety measure. An Actions dropdown per user provides navigation to the user's profile and an admin edit page.

## Acceptance Criteria

- [x] Admin users see an "Admin" link in the navbar
- [x] Non-admin users do not see the "Admin" link; navigating to `/admin/user-management` redirects to home
- [x] All `/admin/*` routes are protected by both middleware and a layout-level admin role check
- [x] The user management page displays all users with their avatar, name, and current roles
- [x] Admins can add any non-protected role to a user via a `+` dropdown
- [x] Admins can remove any non-protected role from a user via dismissible badges (X button)
- [x] Protected roles (e.g. `user`) are displayed as static badges and cannot be removed
- [x] Admins cannot modify their own roles (badges are static with a `(you)` indicator)
- [x] Success and error messages are displayed after each role change
- [x] Loading states are shown on buttons during role toggle operations
- [x] Actions dropdown provides links to view profile and admin edit page
- [x] Adding a new role to the `roles` table requires no code changes — it appears automatically

## Implementation

### Key Files

| Action | File | Description |
|--------|------|-------------|
| Create | `src/app/admin/layout.tsx` | Layout-level admin role guard for all `/admin/*` routes |
| Create | `src/app/admin/user-management/actions.ts` | `toggleRole` server action |
| Create | `src/app/admin/user-management/user-management-table.tsx` | Interactive table client component |
| Create | `src/app/admin/user-management/page.tsx` | Admin page (server component) |
| Create | `src/routes.ts` | Centralized nav link definitions and `NavLink` type |
| Modify | `src/components/navbar.tsx` | Imports links from `routes.ts`, adds admin nav link |
| Modify | `src/components/mobile-nav.tsx` | Imports `NavLink` type from `routes.ts` |
| Modify | `src/middleware.ts` | Fixed `!inner` join for admin role check |
| Modify | `docs/features/authentication-and-user-accounts/user-roles.md` | Checked off admin interface acceptance criterion |

### Approach

#### 1. Admin Route Protection — Layout Guard

A server component layout in `src/app/admin/layout.tsx` that verifies the user is authenticated and has the `admin` role. Redirects to `/sign-in` or `/` otherwise. This provides defense in depth alongside the existing middleware check.

#### 2. Server Action — `toggleRole()`

A `'use server'` action in `src/app/admin/user-management/actions.ts` that:

1. Accepts `userId` and `role` (as strings) from form data
2. Rejects any role in the `PROTECTED_ROLES` blocklist (e.g. `user`)
3. Validates the caller is authenticated and has the `admin` role
4. Prevents self-modification (`user.id === userId`)
5. Looks up the role ID from the `roles` table — this validates the role exists in the database
6. Checks if the assignment exists in `user_roles`
7. Inserts or deletes the role assignment accordingly
8. Calls `revalidatePath('/admin/user-management')` on success
9. Returns `FormState` with error or success messages

The action uses a `PROTECTED_ROLES` blocklist rather than an allowlist, so new roles added to the database are automatically assignable without code changes. RLS policies provide an additional safety net at the database level.

#### 3. Client Component — `UserManagementTable`

A `'use client'` component in `src/app/admin/user-management/user-management-table.tsx` with three columns:

- **User** — Avatar and display name
- **Roles** — Interactive role management:
  - Protected roles shown as static `badge-ghost` badges
  - Assigned removable roles shown as dismissible badges with an X button (hover turns red)
  - A `+` badge opens a DaisyUI dropdown listing all unassigned roles to add
  - Admin's own row shows static badges with `(you)` indicator
- **Actions** — Ellipsis (`...`) dropdown menu with:
  - View Profile — links to `/profile/{profile_id}`
  - Edit User — links to `/admin/user-management/{profile_id}/edit` (not yet implemented)

Each role button (`RemoveRoleButton`, `AddRoleButton`) is a separate sub-component with its own `useActionState` hook for independent per-button loading states.

#### 4. Server Page — `/admin/user-management`

A server component in `src/app/admin/user-management/page.tsx` that:

- Is protected by both middleware and layout-level admin role checks
- Fetches in parallel: all profiles, all user_roles (joined with roles), all roles
- Builds a `user_id → string[]` map from user_roles data
- Combines profiles with their roles into a `UserWithRoles` array (includes `profile_id` for action links)
- Derives assignable roles by filtering out `PROTECTED_ROLES` from the roles table
- Passes data to `UserManagementTable` client component

#### 5. Centralized Route Configuration

Extracted nav link arrays from `navbar.tsx` into `src/routes.ts`:

- Exports `NavLink` type and `publicLinks`, `memberLinks`, `adminLinks` arrays
- `navbar.tsx` and `mobile-nav.tsx` both import from this shared module
- Adding new nav links requires editing only `routes.ts`

#### 6. Navbar Admin Link

Modified `src/components/navbar.tsx` to:

- Import link arrays from `@/routes`
- Compute `isAdmin` first, reuse it in the `isMember` check to avoid a duplicate `hasRole` call
- Spread `adminLinks` into `navLinks` when `isAdmin` is true
- Mobile nav automatically picks up the new link (receives `links` as prop)

#### 7. Middleware Fix

Fixed the admin role check in `src/middleware.ts` to use `roles!inner(name)` instead of `roles(name)`. The left join caused `.single()` to fail when a user had multiple roles, incorrectly blocking admin access.

## Key Design Decisions

1. **Protected roles blocklist over assignable roles allowlist** — The `PROTECTED_ROLES` array (`['user']`) blocks specific roles from modification. Any new role added to the `roles` table is automatically assignable through the UI without code changes. This is more extensible than maintaining an allowlist.

2. **Inline role management in the Roles column** — Rather than a separate Actions column for role changes, roles are managed directly as interactive badges. Assigned roles have an X to remove; a `+` dropdown adds new ones. This keeps the UI compact and intuitive.

3. **Per-button loading states** — Each `RemoveRoleButton` and `AddRoleButton` is a separate component with its own `useActionState` hook. Toggling one role shows a spinner only on that button.

4. **Defense in depth for admin routes** — Admin routes are protected by three layers: middleware redirect, layout-level role check, and server action validation. Each layer independently prevents unauthorized access.

5. **Server-side validation + RLS** — The server action validates admin role, prevents self-modification, and checks role validity. RLS policies at the database level provide a second layer of protection against any bugs in the application code.

6. **Centralized route configuration** — Nav links are defined in `src/routes.ts` and shared across desktop and mobile navbars, ensuring consistency and making it easy to add new links.

7. **Middleware inner join fix** — The original `roles(name)` select performed a left join, causing `.single()` to fail when a user had multiple `user_roles` rows. Using `roles!inner(name)` ensures only the matching row is returned.

## Notes

- The first admin must be seeded manually in the database (see [User Roles](../authentication-and-user-accounts/user-roles.md) for details).
- The `user` role is permanently assigned via a database trigger on profile creation and cannot be removed through the UI.
- The table shows all users including the current admin, but the admin's own row has role modifications disabled.
- The Actions column "Edit User" link points to `/admin/user-management/{profile_id}/edit` which is not yet implemented.
- Future enhancements could include search/filter, pagination for large user lists, and bulk role operations.
