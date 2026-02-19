# Sign Up / Sign In via Supabase Auth

**Epic:** Authentication & User Accounts
**Status:** Completed

## Summary

Allow users to create an account and log in using email and password through Supabase Auth.

## Acceptance Criteria

- [x] Users can sign up with email and password
- [x] Users can sign in with existing credentials
- [x] Users can sign out
- [x] Auth state persists across page refreshes (SSR-compatible via `@supabase/ssr`)
- [x] Error messages display for invalid credentials or duplicate accounts

## Implementation

### Routes

- `/sign-up` — Registration page
- `/sign-in` — Login page
- `/auth/callback` — Supabase auth callback handler for confirming email/session exchange

### Key Files

- `src/app/(auth)/layout.tsx` — Minimal centered layout for auth pages
- `src/app/(auth)/sign-up/page.tsx` — Sign up form
- `src/app/(auth)/sign-in/page.tsx` — Sign in form
- `src/app/(auth)/actions.ts` — Server actions for `signUp`, `signIn`, `signOut`
- `src/app/auth/callback/route.ts` — Auth callback route handler
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server-side Supabase client (cookies-based)
- `src/middleware.ts` — Auth session refresh middleware

### Approach

1. **Supabase client setup** — Browser and server Supabase clients using `@supabase/ssr` with cookie-based session management.
   - `src/lib/supabase/client.ts` — Browser client created with `createBrowserClient()` from `@supabase/ssr`. References `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` env vars.
   - `src/lib/supabase/server.ts` — Async server client created with `createServerClient()` from `@supabase/ssr`. Reads/writes auth tokens via Next.js `cookies()` from `next/headers`. The `setAll` callback is wrapped in a try/catch to handle calls from Server Components where cookies are read-only (middleware handles the refresh in that case).

2. **Middleware** — `src/middleware.ts` refreshes the auth session on every request.
   - Creates a `createServerClient` inline using request/response cookie accessors (sets cookies on both the request and a new `NextResponse`).
   - Calls `supabase.auth.getUser()` to refresh the session and rewrite expired tokens into the response cookies.
   - Matcher excludes static assets: `_next/static`, `_next/image`, `favicon.ico`, and common image extensions (`svg|png|jpg|jpeg|gif|webp`).
   - Does **not** handle redirects or route protection — that is handled separately in the [protected routes](./protected-routes.md) feature.

3. **Auth layout** — `src/app/(auth)/layout.tsx`
   - Uses a `(auth)` route group so sign-up/sign-in pages share a minimal layout without the main app navigation.
   - Renders children centered on screen with `flex min-h-screen items-center justify-center`.

4. **Sign up page** — `src/app/(auth)/sign-up/page.tsx`
   - Client component (`'use client'`) using React `useActionState` hook bound to the `signUp` server action.
   - DaisyUI card layout (`card`, `card-body`, `card-title`) with email and password inputs (`input input-bordered`).
   - Password field has `minLength={6}` for client-side validation.
   - Submit button shows a DaisyUI loading spinner (`loading loading-spinner`) while `pending`.
   - On success, displays a `alert-success` message: "Check your email to confirm your account."
   - On error, displays the Supabase error message in an `alert-error` alert.
   - Includes a link to `/sign-in` for existing users.

5. **Sign in page** — `src/app/(auth)/sign-in/page.tsx`
   - Client component (`'use client'`) using React `useActionState` hook bound to the `signIn` server action.
   - Same DaisyUI card layout as the sign-up page, without `minLength` on the password field.
   - Submit button shows a loading spinner while `pending`.
   - On error, displays the Supabase error message in an `alert-error` alert.
   - On success, the server action redirects to `/` (no client-side success message needed).
   - Includes a link to `/sign-up` for new users.

6. **Auth server actions** — `src/app/(auth)/actions.ts`
   - Marked with `'use server'` directive. Exports three actions: `signUp`, `signIn`, `signOut`.
   - Shared `AuthState` type: `{ error?: string; success?: string } | null`.
   - `signUp(prevState, formData)` — Calls `supabase.auth.signUp({ email, password })`. Returns `{ success }` on success or `{ error }` on failure. Does not redirect (user stays on page to see the confirmation message).
   - `signIn(prevState, formData)` — Calls `supabase.auth.signInWithPassword({ email, password })`. Returns `{ error }` on failure. Calls `redirect('/')` on success.
   - `signOut()` — Calls `supabase.auth.signOut()`, then `redirect('/sign-in')`.

7. **Auth callback route** — `src/app/auth/callback/route.ts`
   - Next.js route handler (`GET`) that handles the redirect from Supabase email confirmation links.
   - Reads `code` and optional `next` (defaults to `/`) query parameters from the URL.
   - Calls `supabase.auth.exchangeCodeForSession(code)` to complete email verification.
   - On success, redirects to `${origin}${next}`.
   - On error (or missing code), redirects to `/sign-in?error=Could not verify your email. Please try again.`.

### Notes

- Environment variables used: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
- All auth forms use DaisyUI v5 component classes for styling.
- Server actions are preferred over client-side API calls — form pages invoke them via `useActionState` which handles the pending/error state lifecycle.
