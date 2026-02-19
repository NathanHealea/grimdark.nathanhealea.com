# User Profile Creation on First Login

**Epic:** Authentication & User Accounts
**Status:** Completed

## Summary

Automatically prompt new users to create their profile after their first successful login.

## Acceptance Criteria

- [x] After first login, user is redirected to a profile setup flow
- [x] User must provide required profile fields before accessing authenticated features
- [x] Profile record is created in the database linked to the Supabase auth user
- [x] Returning users skip the setup flow and go directly to the app

## Implementation

### Routes

- `/profile/setup` — Profile setup form (display name required)

### Key Files

- `src/app/profile/setup/page.tsx` — Setup page (renders `ProfileForm` component)
- `src/app/profile/setup/profile-form.tsx` — Client component with display name form, client-side validation, field-level errors
- `src/app/profile/setup/actions.ts` — `setupProfile` server action (validates, checks uniqueness, inserts profile)
- `src/modules/profile/validation.ts` — Shared validation logic (`validateDisplayName`) and `ProfileFormState` type
- `src/middleware.ts` — Redirects authenticated users without a profile to `/profile/setup`
- `supabase/migrations/20260217215309_create_profiles_table.sql` — Creates `profiles` table with RLS policies
- `supabase/migrations/20260218165934_add_unique_display_name.sql` — Case-insensitive unique index on `display_name`

### Approach

1. **Profiles table** — `id` (uuid FK to `auth.users`), `display_name` (text, not null, unique case-insensitive), `bio` (text, nullable), timestamps. RLS: authenticated users can SELECT all; users can INSERT/UPDATE own row only.

2. **Middleware redirect** — After refreshing the auth session, middleware checks if the authenticated user has a profile. If not, redirects to `/profile/setup`. If they already have a profile and visit `/profile/setup`, redirects to `/`. Public routes (`/sign-in`, `/sign-up`, `/auth/callback`) skip this check.

3. **Profile form** — Client component using `useActionState` with the `setupProfile` server action. Runs client-side validation from shared `validateDisplayName` before submitting. Displays field-level errors below the input with `input-error` styling.

4. **Server action** — Validates display name (required, 2-50 chars, alphanumeric/hyphens/underscores only), checks for existing display name (case-insensitive via `ilike`), inserts profile, and redirects to `/`. Handles duplicate constraint violation (`23505`) as a fallback for race conditions.

5. **Auto-assign user role** — A database trigger on `profiles` insert automatically assigns the `user` role via the `user_roles` table (see [User Roles](./user-roles.md)).

### Notes

- Display names are unique (case-insensitive) — "Ragnar" and "ragnar" are treated as the same name.
- Display names cannot contain spaces — only letters, numbers, hyphens, and underscores.
- The profile setup flow is enforced at the middleware level, so no authenticated route can be accessed without a profile.
