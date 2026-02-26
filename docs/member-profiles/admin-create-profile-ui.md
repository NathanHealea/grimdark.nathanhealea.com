# Admin Create Profile UI Refactor

**Epic:** Member Profiles
**Type:** Enhancement
**Status:** In Progress

## Summary

Refactor the admin create profile page (`/admin/user-management/create`) to match the standard form layout used by the member edit and admin edit profile pages. The current page uses a centered card layout with unsectioned fields, while all other form pages use the `page-layout` / `page-container` / `page-content` pattern with sectioned fieldsets.

## Motivation

The create profile page was built before the reusable CSS classes were extracted and the standard form layout was established. It looks visually inconsistent with the admin edit profile page and member edit profile page, which use sectioned forms with `ornament section-header` headers, `form-section` fieldsets, and `input-lg` sizing.

## Acceptance Criteria

- [x] Page uses `page-layout` / `page-container` / `page-content` wrapper (not centered card)
- [x] Back button links to `/admin/user-management` using `btn-back` class
- [x] Title uses `text-h1` class with subtitle text
- [x] Fields grouped into sections: Profile (display name, bio), Admin Settings (link ID, league role), Factions
- [x] Each section has `ornament section-header` heading and `form-section` fieldset
- [x] Inputs use `input-lg`, `textarea-lg`, `select-lg` sizing
- [x] Admin Settings section uses 2-column grid on sm+ (matching admin edit page)
- [x] Submit button uses `btn btn-primary btn-lg w-full`
- [x] Success and error alerts displayed above the form

## Approach

### Step 1: Update page.tsx layout

Replace the centered card wrapper with the standard page layout pattern:
- `page-layout` > `page-container` > `page-content`
- Add header block with `btn-back` link, `text-h1` title, and subtitle

### Step 2: Update create-profile-form.tsx

Restructure the form to match the admin edit profile form:

1. Add success/error alert banners above the form
2. Group fields into three sections:
   - **Profile**: display name, bio (with `ornament section-header` + `form-section`)
   - **Admin Settings**: link_id + league role in 2-column grid (with `ornament section-header` + `form-section`)
   - **Factions**: faction selector (with `ornament section-header` + `form-section`)
3. Use `input-lg`, `textarea-lg`, `select-lg` sizing on all inputs
4. Change submit button to `btn btn-primary btn-lg w-full`

No changes needed to `actions.ts` — this is purely a UI refactor.

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/admin/user-management/create/page.tsx` | Replace centered card layout with standard page layout + back button |
| Modify | `src/app/admin/user-management/create/create-profile-form.tsx` | Restructure form into sections, update sizing, add alerts |

## Key Decisions

1. **Match admin edit page pattern** — The admin edit profile form is the closest reference since it has the same Admin Settings section (link_id, league role). The create form should mirror that structure exactly.

2. **No changes to server action** — The form field names and behavior remain identical; only the visual layout changes.

## Notes

- Reference files: `src/app/admin/user-management/[profileId]/edit/page.tsx` and `admin-edit-profile-form.tsx`
- Reusable CSS classes defined in `src/app/globals.css`
