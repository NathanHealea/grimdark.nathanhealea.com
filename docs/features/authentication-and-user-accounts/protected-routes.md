# Protected Routes for Authenticated Features

**Epic:** Authentication & User Accounts

## Summary

Restrict access to authenticated-only pages so that unauthenticated users are redirected to sign in.

## Acceptance Criteria

- [x] Unauthenticated users are redirected to the sign-in page when accessing protected routes
- [x] Authenticated users can access all protected routes
- [x] Middleware or layout-level auth check handles protection consistently
- [x] Public pages (league info, landing) remain accessible without login

## Implementation

### Key Files

- `src/middleware.ts` — Central auth and profile checks for all routes
- `src/app/(auth)/layout.tsx` — Auth page layout (sign-in, sign-up)

### Approach

1. **Middleware-based protection** — The middleware in `src/middleware.ts` runs on every non-static request. It:
   - Refreshes the auth session via `supabase.auth.getUser()`
   - Defines `PUBLIC_ROUTES` (`/sign-in`, `/sign-up`, `/auth/callback`) that skip all protection checks
   - For authenticated users without a profile, redirects to `/profile/setup`
   - For admin routes (`/admin/*`), checks the user has the `admin` role

2. **Public routes** — Sign-in, sign-up, and the auth callback are accessible without authentication. The home page (`/`) renders different content based on auth state (server component checks `supabase.auth.getUser()`).

3. **Role-based route protection** — Admin routes are additionally gated by role. See [User Roles](./user-roles.md) for details.

### Notes

- The middleware matcher excludes static assets (`_next/static`, `_next/image`, `favicon.ico`, image files).
- Route protection and profile enforcement are handled in a single middleware pass to minimize overhead.
