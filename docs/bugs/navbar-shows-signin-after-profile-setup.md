# Navbar Shows Sign In/Sign Up After First-Time Profile Setup

**Status:** Open
**Severity:** Medium
**Area:** Authentication / Navigation

## Description

After a new user signs up and completes the profile setup flow, the navbar continues to display "Sign In" and "Sign Up" links instead of the authenticated navigation items ("My Profile", "Edit Profile", "Sign Out").

## Steps to Reproduce

1. Navigate to `/sign-up` and create a new account
2. Complete email verification (if applicable)
3. Get redirected to `/profile/setup`
4. Fill out the display name and submit the form
5. Get redirected to the home page (`/`)
6. Observe the navbar

## Expected Behavior

After completing profile setup, the navbar should display:
- **My Profile** — link to the user's profile page
- **Edit Profile** — link to `/profile/edit`
- **Sign Out** — button to end the session

## Actual Behavior

The navbar still shows "Sign In" and "Sign Up" links as if the user is not authenticated.

## Root Cause (Suspected)

The `Navbar` component (`src/components/navbar.tsx`) is a server component that calls `getAuthUser({ withProfile: true })`. This function returns `null` when the user exists but has no profile yet (the `withProfile` overload requires a profile row to exist). After profile setup, the redirect to `/` may be serving a cached version of the navbar, or the Supabase auth cookie may not be refreshed in the server component context after the redirect.

The setup action (`src/app/profile/setup/actions.ts`) calls `redirect('/')` after inserting the profile. The navbar's cached RSC payload from before the profile existed may still be served.

## Affected Files

- `src/components/navbar.tsx` — server component rendering auth-dependent navigation
- `src/lib/supabase/auth.ts` — `getAuthUser()` returns `null` when profile is missing with `withProfile: true`
- `src/app/profile/setup/actions.ts` — redirect after profile creation

## Possible Fixes

- Ensure the redirect from the setup action invalidates the cached navbar (e.g. `revalidatePath('/')` before redirecting)
- Split the `getAuthUser` check in the navbar: check `user` for auth state (show Sign Out), check `profile` separately for profile-dependent links (My Profile)
