# Sign Up / Sign In via Supabase Auth

**Epic:** Authentication & User Accounts

## Summary

Allow users to create an account and log in using email and password through Supabase Auth.

## Acceptance Criteria

- [ ] Users can sign up with email and password
- [ ] Users can sign in with existing credentials
- [ ] Users can sign out
- [ ] Auth state persists across page refreshes (SSR-compatible via `@supabase/ssr`)
- [ ] Error messages display for invalid credentials or duplicate accounts

## Implementation

### Routes

- `/sign-up` — Registration page
- `/sign-in` — Login page
- `/auth/callback` — Supabase auth callback handler for confirming email/session exchange

### Key Files

- `src/app/(auth)/sign-up/page.tsx` — Sign up form
- `src/app/(auth)/sign-in/page.tsx` — Sign in form
- `src/app/auth/callback/route.ts` — Auth callback route handler
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server-side Supabase client (cookies-based)
- `src/middleware.ts` — Auth session refresh middleware

### Approach

1. **Supabase client setup** — Create browser and server Supabase clients using `@supabase/ssr` with cookie-based session management.
   - `src/lib/supabase/client.ts` — Browser client created with `createBrowserClient()` from `@supabase/ssr`. Used in client components.
   - `src/lib/supabase/server.ts` — Server client created with `createServerClient()` from `@supabase/ssr`. Reads/writes auth tokens via Next.js `cookies()`. Used in server components, server actions, and route handlers.
   - Both clients reference `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from environment variables.

2. **Middleware** — Add Next.js middleware (`src/middleware.ts`) to refresh the auth session on every request.
   - Creates a server Supabase client within the middleware using the request/response cookie accessors.
   - Calls `supabase.auth.getUser()` to refresh the session and rewrite expired tokens into the response cookies.
   - Runs on all routes via a `matcher` config that excludes static assets (`_next/static`, `_next/image`, `favicon.ico`).
   - Does **not** handle redirects or route protection — that is handled separately in the [protected routes](./protected-routes.md) feature.

3. **Sign up page** — `src/app/(auth)/sign-up/page.tsx`
   - Client component with a form containing email and password fields.
   - On submit, calls a server action that invokes `supabase.auth.signUp({ email, password })`.
   - On success, displays a confirmation message prompting the user to check their email.
   - On error (duplicate email, weak password), displays the error message inline.
   - Includes a link to the sign-in page for existing users.

4. **Sign in page** — `src/app/(auth)/sign-in/page.tsx`
   - Client component with a form containing email and password fields.
   - On submit, calls a server action that invokes `supabase.auth.signInWithPassword({ email, password })`.
   - On success, redirects to the home page (`/`).
   - On error (invalid credentials), displays the error message inline.
   - Includes a link to the sign-up page for new users.

5. **Auth callback route** — `src/app/auth/callback/route.ts`
   - Next.js route handler (`GET`) that handles the redirect from Supabase email confirmation links.
   - Reads the `code` query parameter from the URL.
   - Calls `supabase.auth.exchangeCodeForSession(code)` to complete the email verification.
   - On success, redirects to the home page or a `next` URL if provided.
   - On error, redirects to an error page or sign-in with an error message.

6. **Sign out** — Server action calling `supabase.auth.signOut()`, then redirect to sign-in.
   - Exposed as a server action in `src/app/(auth)/actions.ts` (shared across auth-related components).
   - Can be triggered from a sign-out button in the app navigation.
   - After sign out, redirects to `/sign-in`.

7. **Auth server actions** — `src/app/(auth)/actions.ts`
   - Centralizes all auth-related server actions: `signUp`, `signIn`, `signOut`.
   - Each action creates a server Supabase client, performs the auth call, and returns errors or redirects.
   - Form pages call these actions via React `useActionState` (or direct invocation) to handle loading and error states.

### Notes

- Use a `(auth)` route group for sign-up/sign-in pages to share a minimal layout without the main app navigation.
- Server actions preferred over client-side API calls where possible.
