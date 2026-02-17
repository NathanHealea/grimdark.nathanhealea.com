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
2. **Middleware** — Add Next.js middleware to refresh the auth session on every request.
3. **Sign up page** — Form with email/password fields. Calls `supabase.auth.signUp()`. Redirects to sign-in or shows confirmation message.
4. **Sign in page** — Form with email/password fields. Calls `supabase.auth.signInWithPassword()`. Redirects to home on success.
5. **Auth callback route** — Handles the code exchange from Supabase email confirmation links.
6. **Sign out** — Server action or API route calling `supabase.auth.signOut()`, then redirect to sign-in.

### Notes

- Use a `(auth)` route group for sign-up/sign-in pages to share a minimal layout without the main app navigation.
- Server actions preferred over client-side API calls where possible.
