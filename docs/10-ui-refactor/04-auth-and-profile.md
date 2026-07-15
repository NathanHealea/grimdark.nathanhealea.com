# Auth & Profile Domain

**Epic:** UI Refactor
**Type:** Refactor
**Status:** Todo
**Merge Into:** epic/ui-refactor

## Summary

Migrate the authentication pages and profile forms off DaisyUI. These share a near-identical card + form structure, so they migrate together as the first domain slice. Depends on docs 01–03.

## Acceptance Criteria

- [ ] `(auth)/sign-in`, `(auth)/sign-up`, `(auth)/forgot-password`, `(auth)/reset-password` pages migrated: `card`/`card-body`/`card-title`, `fieldset`, `input`/`input-bordered`, `label`, `link`/`link-primary`, `btn`/`btn-primary`/`btn-outline`, `alert`/`alert-error`/`alert-success`, `divider`, and `loading` spinner all use the new primitives.
- [ ] `profile/edit/edit-profile-form.tsx` migrated: `alert`, `btn`/`btn-lg`/`btn-primary`, `input`/`input-bordered`, `label`, `form-section`, `form-error`, `section-header`, `loading` → primitives.
- [ ] `profile/setup/profile-form.tsx` migrated: `alert`/`alert-warning`, `card`, `fieldset`, `label`, `btn`, `loading` → primitives.
- [ ] `profile/[profileId]/page.tsx` and `profile/edit/page.tsx` migrated: `card-interactive`, `badge`, `btn-back`, `info-row`, `label-meta`, `section-header`, `empty-text` → migrated aliases/primitives.
- [ ] Form submission, validation errors, `useActionState` flows, and OAuth buttons behave exactly as before; pages render identically to `main`. `npm run build` + `npm run lint` pass.

## Approach

1. Migrate the 4 auth pages first (shared structure — do sign-in, then apply the same diff shape to the other three).
2. Migrate profile view/edit routes and their colocated form components.
3. Verify the `loading` spinner replacement in submit buttons matches the old inline spinner.

### Affected Files

| Action | File | Changes |
|---|---|---|
| Modify | `src/app/(auth)/{sign-in,sign-up,forgot-password,reset-password}/page.tsx` | DaisyUI → primitives |
| Modify | `src/app/profile/edit/{page.tsx,edit-profile-form.tsx}` | DaisyUI → primitives |
| Modify | `src/app/profile/setup/profile-form.tsx` | DaisyUI → primitives |
| Modify | `src/app/profile/[profileId]/page.tsx` | DaisyUI → primitives |

### Risks & Considerations

- Auth is critical-path; verify error/success alert states and the OAuth (Discord) button styling.
- Preserve `useActionState` pending states driving the spinner.
