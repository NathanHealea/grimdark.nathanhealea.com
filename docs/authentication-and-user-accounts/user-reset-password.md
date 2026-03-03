# User Password Reset and Change

**Epic:** Authentication and User Accounts
**Type:** Feature
**Status:** In Progress

<!--
Status values:
  Todo        — Not started, no acceptance criteria completed
  In Progress — Partially implemented, some acceptance criteria completed
  Completed   — Fully implemented, all acceptance criteria completed
-->

## Summary

Add two password flows: (1) a "forgot password" flow from the sign-in page that sends a reset email, and (2) an in-app "change password" option on the profile edit page. Both use Supabase Auth's built-in password reset methods with the PKCE flow for SSR compatibility.

## Acceptance Criteria

- [x] Sign-in page displays a "Forgot your password?" link below the password field
- [x] Forgot password page (`/forgot-password`) accepts an email and sends a reset link
- [x] Users receive a branded password reset email matching the app's theme
- [x] Clicking the email link lands on a reset password page (`/reset-password`) where the user enters a new password
- [x] After resetting, the user is redirected to the sign-in page with a success message
- [x] Profile edit page (`/profile/edit`) displays a "Change Password" section for email-authenticated users
- [x] OAuth-only users (Discord) do not see the "Change Password" section
- [x] Password change requires a minimum of 6 characters (matching sign-up validation)
- [x] Error states are handled: invalid/expired token, mismatched passwords, rate limiting
- [x] `npm run build` and `npm run lint` pass with no errors

## Routes

| Route | Description |
|---|---|
| `/forgot-password` | Public page — email input to request password reset |
| `/reset-password` | Public page — new password form after email verification |
| `/auth/confirm` | API route — exchanges token hash for session (PKCE flow) |
| `/profile/edit` | Existing — add "Change Password" section |

## Database

No database schema changes required. Password management is handled entirely by Supabase Auth (`auth.users` table). The only infrastructure change is adding a custom email template and updating Supabase config.

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/(auth)/sign-in/page.tsx` | Add "Forgot your password?" link |
| Create | `src/app/(auth)/forgot-password/page.tsx` | Email input form to request reset |
| Create | `src/app/(auth)/reset-password/page.tsx` | New password form after token verification |
| Modify | `src/app/(auth)/actions.ts` | Add `requestPasswordReset` and `updatePassword` server actions |
| Create | `src/app/auth/confirm/route.ts` | Token hash exchange endpoint for PKCE flow |
| Modify | `src/app/profile/edit/edit-profile-form.tsx` | Add "Change Password" section |
| Create | `src/app/profile/edit/actions.ts` | Add `changePassword` server action |
| Create | `supabase/templates/recovery.html` | Branded password reset email template |
| Modify | `supabase/config.toml` | Reference recovery email template |
| Modify | `src/middleware.ts` | Add `/forgot-password` and `/reset-password` to PUBLIC_ROUTES |

### Approach

#### 1. Create custom password reset email template

Create `supabase/templates/recovery.html` with Grimdark League branding (matching the existing `confirmation.html` template). The template must use the PKCE token format:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
  Reset Password
</a>
```

Update `supabase/config.toml` to reference the template:

```toml
[auth.email.template.recovery]
subject = "Reset Your Password — Grimdark League"
content_path = "./supabase/templates/recovery.html"
```

#### 2. Create `/auth/confirm` route (PKCE token exchange)

Create `src/app/auth/confirm/route.ts` that handles the token hash verification. This is the recommended SSR approach from Supabase docs:

```typescript
// Reads token_hash and type from URL params
// Calls supabase.auth.verifyOtp({ type, token_hash })
// On success: redirects to the `next` param (e.g., /reset-password)
// On failure: redirects to /sign-in with error message
```

This is separate from the existing `/auth/callback` route which handles OAuth code exchange. The confirm route handles email-based token hashes (recovery, signup confirmation, etc.).

#### 3. Create forgot password page and server action

**Page:** `src/app/(auth)/forgot-password/page.tsx`
- Client component with `useActionState` (matching sign-in/sign-up pattern)
- Email input field
- Submit button triggers `requestPasswordReset` action
- Success state shows "Check your email" message
- Link back to sign-in page

**Action:** Add `requestPasswordReset` to `src/app/(auth)/actions.ts`:
```typescript
export async function requestPasswordReset(prevState: AuthState, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/confirm`,
  })

  // Always show success message to prevent email enumeration
  return { success: 'If an account exists with this email, you will receive a password reset link.' }
}
```

#### 4. Create reset password page and server action

**Page:** `src/app/(auth)/reset-password/page.tsx`
- Client component with `useActionState`
- New password + confirm password fields
- Submit button triggers `updatePassword` action
- On success: redirect to sign-in with success message

**Action:** Add `updatePassword` to `src/app/(auth)/actions.ts`:
```typescript
export async function updatePassword(prevState: AuthState, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  await supabase.auth.signOut()
  redirect('/sign-in?message=Password updated successfully. Please sign in with your new password.')
}
```

#### 5. Add "Forgot password?" link to sign-in page

Modify `src/app/(auth)/sign-in/page.tsx` to add a link between the password field and the submit button:

```tsx
<Link href="/forgot-password" className="link link-primary text-sm self-end">
  Forgot your password?
</Link>
```

Also handle the `?message=` query param to display success messages (for post-reset redirect).

#### 6. Add "Change Password" section to profile edit page

Add a "Change Password" section at the bottom of `src/app/profile/edit/edit-profile-form.tsx`:

- Only visible to email-authenticated users (check `user.app_metadata.provider === 'email'` or check `user.identities` for an email identity)
- New password + confirm password fields
- Separate form with its own submit action
- Uses `changePassword` server action in `src/app/profile/edit/actions.ts`

**Action:** Create `src/app/profile/edit/actions.ts`:
```typescript
export async function changePassword(prevState: AuthState, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password updated successfully.' }
}
```

To determine if a user has email auth (and thus can change their password), pass a flag from the server component. In the profile edit page, check the user's identities:

```typescript
const hasEmailAuth = auth.user.identities?.some((i) => i.provider === 'email') ?? false
```

Pass `hasEmailAuth` to the form component, which conditionally renders the section.

#### 7. Update middleware

Add `/forgot-password` and `/reset-password` to `PUBLIC_ROUTES` in `src/middleware.ts`:

```typescript
const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/auth/callback', '/auth/confirm', '/forgot-password', '/reset-password', '/members', '/battle-reports', '/seasons']
```

## Key Design Decisions

1. **PKCE flow with `/auth/confirm` route** — The project uses SSR via `@supabase/ssr`, which requires the PKCE flow for email-based auth. The token hash approach (via `verifyOtp`) is the recommended method from Supabase docs for Next.js App Router. This is separate from the existing `/auth/callback` route which handles OAuth code exchange.

2. **Always show success on forgot password** — To prevent email enumeration attacks, the forgot password action always returns a success message regardless of whether the email exists. This is a security best practice.

3. **Sign out after password reset** — After resetting via the email flow, sign the user out and redirect to sign-in. This forces them to log in with their new password, confirming it works. The in-app change password flow does NOT sign out, since the user is already authenticated.

4. **OAuth users cannot change password** — Users who signed up via Discord OAuth don't have a password to change. The "Change Password" section is hidden for these users by checking `user.identities` for an email provider.

5. **Separate actions file for profile edit** — The `changePassword` action lives in `src/app/profile/edit/actions.ts` (co-located with the profile edit page) rather than in `(auth)/actions.ts`, because it's a profile-scoped operation for authenticated users, not an auth flow action.

## Notes

- The local Supabase Inbucket email server at `127.0.0.1:54324` can be used to test reset emails during development.
- Supabase config has `secure_password_change = false` — if we want to require recent login for in-app password changes, this can be enabled in `config.toml` later.
- The existing `confirmation.html` email template should be used as the visual base for the new `recovery.html` template to maintain consistent branding.
- Rate limiting is configured in Supabase (`max_frequency = "1s"`), which prevents spam of reset emails.
