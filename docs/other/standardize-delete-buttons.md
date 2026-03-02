# Standardize Delete Buttons

**Epic:** Other
**Type:** Enhancement
**Status:** In Progress

## Summary

Standardize all delete/remove buttons across the app to use the outlined error style (`btn btn-error btn-outline`) matching the roster manager's remove button. Each button keeps its current size but adopts the consistent outlined red style.

## Motivation

Delete and remove buttons currently use inconsistent styles — some are solid red (`btn-error`), some are outlined (`btn-error btn-outline`), some are ghost (`btn-ghost`), and role removal uses badge styling. This makes the UI feel inconsistent. Standardizing to `btn-error btn-outline` provides a clear, recognizable pattern for destructive actions that's visually distinct without being as aggressive as solid red.

## Acceptance Criteria

- [x] All delete/remove buttons use `btn btn-error btn-outline` with their current size class
- [x] Delete season button (edit page) uses `btn btn-error btn-outline btn-lg w-full`
- [x] Remove faction button uses `btn btn-error btn-outline btn-xs`
- [x] Remove photo button uses `btn btn-error btn-outline btn-xs`
- [x] Unlink auth button uses `btn btn-error btn-outline btn-sm`
- [x] Merge profiles buttons use `btn btn-error btn-outline btn-sm`
- [x] Role removal badges use `badge badge-sm gap-1 cursor-pointer hover:badge-error` (unchanged — these are badges, not buttons)
- [x] ActionsMenu danger variant items use outlined style
- [x] No functional changes — only CSS class updates

## Approach

### Step 1: Update delete season button

In `src/app/admin/seasons/[id]/edit/delete-season-button.tsx`:
- Change `btn btn-error btn-lg w-full` to `btn btn-error btn-outline btn-lg w-full`

### Step 2: Update faction selector remove button

In `src/modules/faction/components/faction-selector.tsx`:
- Change `btn btn-error btn-xs` to `btn btn-error btn-outline btn-xs`

### Step 3: Update image upload remove button

In `src/components/image-upload.tsx`:
- Change `btn btn-ghost btn-xs` to `btn btn-error btn-outline btn-xs`

### Step 4: Update admin edit profile buttons

In `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx`:
- Unlink button: already `btn btn-error btn-sm btn-outline` — no change needed
- Merge profiles buttons: Change `btn btn-error btn-sm` to `btn btn-error btn-outline btn-sm`

### Step 5: Update ActionsMenu danger variant

In `src/components/actions-menu.tsx` (or wherever the variant styles are defined):
- Update the `danger` variant to include `btn-outline` in its class output

### Step 6: Verify roster manager (reference button)

In `src/app/admin/seasons/[id]/edit/roster-manager.tsx`:
- Already uses `btn btn-error btn-outline btn-xs` — no change needed

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/admin/seasons/[id]/edit/delete-season-button.tsx` | Add `btn-outline` to delete season button |
| Modify | `src/modules/faction/components/faction-selector.tsx` | Add `btn-outline` to remove faction button |
| Modify | `src/components/image-upload.tsx` | Change from `btn-ghost` to `btn-error btn-outline` |
| Modify | `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx` | Add `btn-outline` to merge buttons |
| Modify | `src/components/actions-menu.tsx` | Update danger variant to include `btn-outline` |
| No change | `src/app/admin/seasons/[id]/edit/roster-manager.tsx` | Already correct (reference style) |
| No change | `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx` (unlink) | Already `btn-outline` |
| No change | User management role badges | Badge pattern, not button — leave as-is |

## Key Decisions

1. **Outlined over solid for destructive actions** — Outlined buttons are less visually aggressive while still clearly signaling "danger" via the red color. This matches the roster manager pattern the team prefers.

2. **Keep role badges as-is** — Role removal uses badge styling (`badge hover:badge-error`), not button styling. These serve a different UI purpose (inline tag removal) and don't need to match the button pattern.

3. **Keep existing sizes** — Each button's size (`btn-xs`, `btn-sm`, `btn-lg`) is appropriate for its context. Only the color/outline style is being standardized.
