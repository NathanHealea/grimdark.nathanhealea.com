# Organizer Auth Role

**Epic:** Authentication & User Accounts
**Type:** Enhancement
**Status:** In Progress

## Summary

Add a new `organizer` auth role that grants access to admin features (season management, battle report management) without granting access to user management. This allows league organizers to manage league operations without the ability to modify user accounts, roles, or profiles.

## Motivation

Currently, the only way to give someone admin-level access to manage seasons and battle reports is to grant them the full `admin` role, which also gives them access to user management (creating/editing profiles, assigning roles, unlinking accounts). For a small league with 2-3 organizers, this is an unnecessary security risk — organizers who help run seasons and manage battle reports should not need the ability to modify user accounts or role assignments.

The `organizer` auth role provides a middle ground: full access to league operations (seasons, battle reports) without user management capabilities.

## Acceptance Criteria

- [x] `organizer` role exists in the `roles` database table
- [x] Users with the `organizer` auth role can access `/admin/seasons` and `/admin/battle-reports`
- [x] Users with the `organizer` auth role CANNOT access `/admin/user-management`
- [x] Users with the `organizer` auth role can create and edit seasons
- [x] Users with the `organizer` auth role can view admin battle reports
- [x] The admin menu shows only "Seasons" and "Battle Reports" for organizers (no "Users" link)
- [x] Admins can assign/revoke the `organizer` role via the user management page
- [x] The `Role` TypeScript type includes `'organizer'`
- [x] Middleware correctly gates `/admin/user-management` to `admin` only
- [x] All existing admin functionality continues to work unchanged for `admin` role users
- [ ] Build and lint pass

## Approach

### 1. Database Migration

Add the `organizer` role to the `roles` lookup table:

```sql
INSERT INTO public.roles (name) VALUES ('organizer');
```

No schema changes needed — the existing `roles` + `user_roles` tables already support arbitrary roles.

### 2. TypeScript Type

Update `src/types/role.ts`:

```typescript
export type Role = 'user' | 'admin' | 'organizer'
```

### 3. Role Helper

Add a `hasAnyRole()` function to `src/lib/supabase/roles.ts` for checking if a user has any of several roles:

```typescript
export async function hasAnyRole(userId: string, roles: Role[]): Promise<boolean> {
  const userRoles = await getUserRoles(userId)
  return roles.some((role) => userRoles.includes(role))
}
```

This avoids multiple `hasRole()` calls when checking `admin` OR `organizer`.

### 4. Middleware

Update `src/middleware.ts` to handle the `organizer` role:

- `/admin/user-management/*` — require `admin` role only
- `/admin/*` (everything else) — require `admin` OR `organizer` role

The middleware already queries `user_roles` + `roles` — extend the check to look for either role, then add a secondary check for user-management routes.

### 5. Admin Layout

Update `src/app/admin/layout.tsx` to accept both `admin` and `organizer`:

```typescript
const canAccessAdmin = await hasAnyRole(auth.user.id, ['admin', 'organizer'])
```

### 6. Navbar

Update `src/components/navbar.tsx`:

- Check for both `admin` and `organizer` roles
- Filter `adminLinks` to exclude "Users" for non-admin users
- Show admin menu for organizers with only "Battle Reports" and "Seasons"

Split `adminLinks` in `src/routes.ts` into shared admin links and admin-only links, or filter dynamically.

### 7. Season Server Actions

Update `src/app/admin/seasons/actions.ts`:

- `createSeason()` — accept `admin` or `organizer`
- `updateSeason()` — accept `admin` or `organizer`

Change:
```typescript
const isAdmin = await hasRole(user.id, 'admin')
```
To:
```typescript
const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
```

### 8. User Management Actions (No Change)

All actions in `src/app/admin/user-management/` remain `admin`-only:
- `toggleRole()` — admin only
- `createUnlinkedProfile()` — admin only
- `adminUpdateProfile()` — admin only
- `unlinkProfileAction()` — admin only

### 9. Mobile Nav

Update `src/components/mobile-nav.tsx` to receive filtered admin links (same as desktop navbar).

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_add_organizer_role.sql` | Add `organizer` to roles table |
| Modify | `src/types/role.ts` | Add `'organizer'` to Role type |
| Modify | `src/lib/supabase/roles.ts` | Add `hasAnyRole()` helper |
| Modify | `src/middleware.ts` | Allow organizer on admin routes, restrict user-management to admin |
| Modify | `src/app/admin/layout.tsx` | Accept both admin and organizer |
| Modify | `src/components/navbar.tsx` | Show admin menu for organizers with filtered links |
| Modify | `src/routes.ts` | Split or annotate admin links for role-based filtering |
| Modify | `src/app/admin/seasons/actions.ts` | Accept admin or organizer |
| No change | `src/app/admin/user-management/actions.ts` | Stays admin-only |
| No change | `src/app/admin/user-management/create/actions.ts` | Stays admin-only |
| No change | `src/app/admin/user-management/[profileId]/edit/actions.ts` | Stays admin-only |

### Implementation Steps

1. **Database migration** — Add `organizer` role to `roles` table
2. **Type + helper** — Update `Role` type, add `hasAnyRole()`
3. **Middleware** — Update route protection for organizer access
4. **Admin layout** — Update guard to accept organizer
5. **Navbar + routes** — Filter admin links by role
6. **Season actions** — Update permission checks
7. **Verify** — Test all admin routes as admin and organizer
8. **Build and lint** — Ensure no errors

## Key Decisions

1. **Auth role, not profile role** — The `organizer` role is added to the `roles` table (auth system), not the `profiles.role` column (league system). This keeps the two role systems cleanly separated: auth roles control system access, profile roles control league participation.

2. **Additive permissions** — The `organizer` role grants a subset of admin capabilities. It does NOT replace or overlap with the existing `profiles.role = 'organizer'` league role, which controls battle report submission rights. A user could have both.

3. **Middleware-level route protection** — User management routes are blocked at the middleware level for organizers, providing defense-in-depth alongside the server action checks. This means organizers can't even load the user management pages.

4. **Shared `hasAnyRole()` helper** — Rather than checking `hasRole(id, 'admin') || hasRole(id, 'organizer')` (which makes two DB queries), a single `hasAnyRole()` call fetches roles once and checks locally.

## Notes

- The `profiles.role` column already has `'organizer'` as a valid value for league membership. This is a separate concept from the auth `organizer` role. A person could be a league organizer (profile role) without having admin panel access (auth role), or vice versa.
- RLS policies on `user_roles` already allow admins to assign any role — the `organizer` auth role can be assigned immediately via the existing toggle UI.
- The `PROTECTED_ROLES` array in `user-management/actions.ts` only protects the `'user'` role from being toggled. The `organizer` role will be toggleable by admins just like the `admin` role.
