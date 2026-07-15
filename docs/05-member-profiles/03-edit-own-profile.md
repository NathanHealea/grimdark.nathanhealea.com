# Edit Own Profile

**Epic:** Member Profiles
**Type:** Feature
**Status:** Completed

## Summary

Allow members to update their own profile information (display name and bio).

## Acceptance Criteria

- [x] Authenticated members can access an edit form for their profile at `/profile/edit`
- [x] Members can update display name and bio
- [x] Display name is validated (2-50 chars, alphanumeric/spaces/hyphens/underscores, unique case-insensitive)
- [x] Bio is optional with a 500-character limit
- [x] Changes are saved to the database and reflected immediately
- [x] Members cannot edit another member's profile (RLS enforced)
- [x] Success and error messages are displayed to the user

## Implementation

- **Page:** `src/app/profile/edit/page.tsx` — server component that fetches the user's profile
- **Form:** `src/app/profile/edit/edit-profile-form.tsx` — client component with `useActionState`
- **Action:** `src/app/profile/edit/actions.ts` — `updateProfile` server action
- **Validation:** Reuses `validateDisplayName` and `validateBio` from `src/app/profile/setup/validation.ts`
