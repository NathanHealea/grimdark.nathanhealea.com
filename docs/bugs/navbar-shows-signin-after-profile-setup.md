# Navbar Shows Sign In/Sign Up After First-Time Profile Setup

**Status:** Fixed
**Severity:** Medium
**Area:** Authentication / Navigation

## Description

After a new user signs up and completes the profile setup flow, the navbar continues to display "Sign In" and "Sign Up" links instead of the authenticated navigation items ("My Profile", "Edit Profile", "Sign Out"). The same issue occurs after email/password sign-in and OAuth sign-in.

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

## Root Cause

The `Navbar` component (`src/components/navbar.tsx`) is a server component rendered inside the root layout (`src/app/layout.tsx`). Next.js caches the RSC payload for layouts across navigations. When server actions or route handlers called `redirect()` after authentication state changes, the root layout's cached RSC payload (including the navbar) was still served — showing the stale unauthenticated state.

None of the auth-related actions or routes called `revalidatePath()` before redirecting, so the layout cache was never invalidated after sign-in, sign-out, or profile setup.

## Fix

Added `revalidatePath('/', 'layout')` before every `redirect()` call in auth-related server actions and route handlers. This invalidates the root layout's cached RSC payload, forcing the `Navbar` server component to re-render with the current auth state.

### Files Changed

- **`src/app/(auth)/actions.ts`** — Added `revalidatePath('/', 'layout')` before `redirect()` in `signIn` and `signOut`
- **`src/app/profile/setup/actions.ts`** — Added `revalidatePath('/', 'layout')` before `redirect('/')` after profile creation
- **`src/app/auth/callback/route.ts`** — Added `revalidatePath('/', 'layout')` before `NextResponse.redirect()` after OAuth code exchange

### Why `'layout'` Scope

Using `revalidatePath('/', 'layout')` specifically targets the root layout and all nested layouts, which is where the `Navbar` lives. This is more precise than a full page revalidation and ensures the navbar re-renders with fresh auth data on the next request.
