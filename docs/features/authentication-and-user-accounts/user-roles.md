# User Roles

**Epic:** Authentication & User Accounts

## Summary

Assign roles to user accounts to control access levels across the application. Users can hold **multiple roles** simultaneously. Three roles exist:

- **user** — default role assigned to every account on sign-up. Grants basic access (view content, submit battle reports, manage own profile).
- **member** — promoted role for active league participants. Grants additional league-specific privileges.
- **admin** — promoted role for league organizers. Grants full management capabilities (role assignment, content moderation, league settings).

Admins can grant or revoke the `member` and `admin` roles through an admin interface. The `user` role is always present and cannot be removed.

## Acceptance Criteria

- [ ] A `roles` table exists with seeded `user`, `member`, and `admin` entries
- [ ] A `user_roles` table links users to roles (many-to-many — a user can hold multiple roles)
- [ ] New users are automatically assigned the `user` role upon profile creation
- [ ] The `user` role cannot be removed from any account
- [ ] At least one admin is seeded or manually assigned in the database
- [ ] Admins can grant or revoke the `member` and `admin` roles via an admin interface
- [ ] RLS policies on `user_roles` prevent non-admin users from modifying role assignments
- [ ] A helper function or utility exists to check a user's roles on the server
- [ ] Role information is available in middleware for route-level access control

## Data Model

### `roles` Table

| Column | Type | Constraints |
| ------ | ---- | ----------- |
| `id` | `serial` | Primary key |
| `name` | `text` | Unique, not null |

Seeded with three rows: `user`, `member`, `admin`.

### `user_roles` Table

| Column | Type | Constraints |
| ------ | ---- | ----------- |
| `user_id` | `uuid` | FK → `profiles.id` on delete cascade, part of composite PK |
| `role_id` | `int` | FK → `roles.id`, part of composite PK |
| `assigned_at` | `timestamptz` | Not null, default `now()` |

Composite primary key on `(user_id, role_id)`.

## Row Level Security

### `roles` Table

- **SELECT**: All authenticated users can read roles (needed for display/lookups).
- **INSERT / UPDATE / DELETE**: No user-facing mutations — managed via migrations/seed only.

### `user_roles` Table

- **SELECT**: Authenticated users can read all role assignments (needed for directory display, role badges, etc.).
- **INSERT**: Only users with the `admin` role can assign roles to other users.
- **UPDATE**: Only admins can change role assignments.
- **DELETE**: Only admins can remove role assignments.
- Users cannot modify their own role assignment regardless of their role.

## Approach

### 1. Database Migration

Create a new migration that:

1. Creates the `roles` table and seeds `user`, `member`, and `admin` rows.
2. Creates the `user_roles` table with foreign keys to `profiles` and `roles`.
3. Enables RLS on both tables.
4. Creates RLS policies as described above.
5. Creates a helper SQL function `public.get_user_roles(user_uuid uuid)` that returns an array of the user's role names.

### 2. Auto-Assign Default `user` Role

Modify the profile creation flow so that when a new profile is inserted, a `user_roles` row is also created linking the user to the `user` role. This can be handled by:

- **Option A**: A database trigger on `profiles` insert that auto-inserts into `user_roles`.
- **Option B**: Adding the `user_roles` insert to the existing profile setup server action.

Option A (trigger) is preferred for consistency — it guarantees every profile has the `user` role regardless of how it was created.

### 3. Server-Side Role Check Utility

Add a utility in `src/lib/supabase/` (e.g., `roles.ts`) that exposes:

```ts
type Role = 'user' | 'member' | 'admin'

async function getUserRoles(userId: string): Promise<Role[]>
async function hasRole(userId: string, role: Role): Promise<boolean>
```

`getUserRoles` queries `user_roles` joined with `roles` and returns all role names for the user. `hasRole` is a convenience wrapper. Used by server actions and API routes to gate role-specific operations.

### 4. Middleware Integration

Extend `src/middleware.ts` to make the user's roles available for route-level checks. For role-restricted routes (e.g., `/admin/*`), the middleware should:

1. Query the user's roles after the existing profile check.
2. Redirect users who lack the required role away from restricted routes (e.g., to `/`).

### 5. Admin Role Management UI

Create an admin page (e.g., `/admin/users`) where admins can:

- View a list of all users with their current roles.
- Grant or revoke the `member` and `admin` roles (a user can hold both).
- The `user` role is always present and cannot be removed through the UI.
- Uses a server action that verifies the caller has the `admin` role before performing any role changes.

### 6. Seeding the First Admin

The first admin must be assigned manually since no admin UI exists yet at the start. This is done by:

1. Creating an account through the normal sign-up flow (assigned the `user` role by default).
2. Running a SQL command or using Supabase Studio to insert an `admin` role assignment for that user.

Document this step in the project README or a setup guide.

## Implementation

### Key Files

- `supabase/migrations/20260218000000_create_roles_tables.sql` — Migration for `roles` table, `user_roles` table, RLS policies, helper function, and auto-assign trigger
- `src/types/role.ts` — `Role` type definition
- `src/lib/supabase/roles.ts` — Server-side `getUserRoles` and `hasRole` utilities
- `src/middleware.ts` — Updated with admin route protection

## Key Design Decisions

1. **Three-tier role system (`user`, `member`, `admin`)** — The `user` role is a permanent baseline assigned to every account, ensuring all users have a defined access level. `member` and `admin` are promotional roles granted by admins. This separates "has an account" from "is an active league participant" from "can manage the league."

2. **Multi-role support (many-to-many)** — Users can hold multiple roles simultaneously (e.g., a user can be both `member` and `admin`). This avoids a strict hierarchy where higher roles implicitly include lower role permissions and makes permission checks explicit — `hasRole(userId, 'member')` means exactly what it says.

3. **Separate `roles` and `user_roles` tables over a column on `profiles`** — A dedicated join table supports the many-to-many relationship, keeps role data normalized, and makes it straightforward to add new roles in the future (just insert a row into `roles`). It also enables tracking when roles were assigned via `assigned_at`.

4. **Database trigger for auto-assignment** — A PostgreSQL trigger on `profiles` insert automatically assigns the `user` role. This guarantees consistency regardless of how the profile is created (server action, migration, Supabase Studio, etc.) rather than relying on application code to remember the insert.

5. **`user` role cannot be deleted via RLS** — The delete policy on `user_roles` explicitly excludes rows where `role_id` matches the `user` role. This is enforced at the database level so no application bug or admin mistake can strip a user's base role.

6. **Self-modification prevention** — All write policies on `user_roles` include `auth.uid() != user_id`, preventing admins from modifying their own roles. This is a safety measure to prevent privilege escalation or accidental self-demotion.

7. **`security definer` on helper functions** — The `get_user_roles` SQL function and the trigger function use `security definer` so they execute with the permissions of the function owner (typically the migration runner), bypassing RLS. This is necessary because the trigger runs during insert (before the user has any roles) and the helper function is used inside other RLS policies.

8. **Server-only role enforcement** — All role checks happen on the server (middleware, server actions, RLS policies). The client never receives role data for authorization purposes. This prevents client-side tampering and keeps the trust boundary at the server.

## Notes

- Users can hold multiple roles simultaneously (e.g., a user could be both `member` and `admin`).
- The `user` role is the baseline — it is always assigned and cannot be removed.
- The many-to-many structure supports future expansion (e.g., adding `moderator` or `organizer` roles) without schema changes — just insert a new row into `roles`.
- Role checks should happen server-side only — never trust the client to enforce role-based access.
- The `get_user_roles` SQL function can be used inside other RLS policies to gate table access by role (e.g., only admins can delete battle reports).
