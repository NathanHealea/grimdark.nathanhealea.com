# Shared App Components

**Epic:** UI Refactor
**Type:** Refactor
**Status:** Completed
**Branch:** refactor/shared-app-components
**Merge Into:** epic/ui-refactor

## Summary

Migrate the reusable app-level components in `src/components/` off DaisyUI onto the new primitives and per-component stylesheets. These include navigation, menus, and upload widgets shared across many routes. Depends on docs 01–02.

## Acceptance Criteria

- [x] `navbar.tsx` — DaisyUI `navbar`/`navbar-start/center/end`/`menu` replaced with a `navbar.css` layout; buttons use `btn` primitives. Behavior and links unchanged.
- [x] `mobile-nav.tsx` — DaisyUI `menu`/`menu-title`/`divider` replaced; keeps its Headless UI interaction.
- [x] `user-menu.tsx` — restyled with `btn` primitives + `avatar`; Headless UI `Menu` interaction unchanged (per decision).
- [x] `admin-menu.tsx` — restyled with `btn` primitives; Headless UI `Menu` interaction unchanged.
- [x] `actions-menu.tsx` — the shared row-action dropdown used by all `*-actions.tsx` files: DaisyUI `btn`/`rounded-box`/`rounded-btn`/`bg-base-*` replaced with tokens; Headless UI `Menu` unchanged. Migrating this alone covers every `*-actions.tsx` wrapper.
- [x] `image-upload.tsx` — `btn` variants replaced with `btn` primitives.
- [x] `avatar.tsx` — wraps the new `avatar` primitive; `avatar-placeholder` behavior preserved.
- [x] `tooltip.tsx` / `scroll-banner.tsx` — confirmed token-aligned (already non-DaisyUI).
- [x] All menus still auto-close on item click; keyboard nav and focus management unchanged. `npm run build` + `npm run lint` pass; navbar/menus render identically to `main`.

## Approach

1. Start with `actions-menu.tsx` (highest leverage — unblocks 6 `*-actions.tsx` wrappers with no further edits).
2. Migrate `navbar.tsx` + `mobile-nav.tsx` together (shared nav markup); add `navbar.css` for the shell layout, use `btn` primitives for actions.
3. Migrate `user-menu.tsx`, `admin-menu.tsx`, `avatar.tsx`, `image-upload.tsx`.
4. Reconcile `tooltip.tsx`/`scroll-banner.tsx` classes to tokens.

### Affected Files

| Action | File | Changes |
|---|---|---|
| Modify | `src/components/{navbar,mobile-nav,user-menu,admin-menu,actions-menu,image-upload,avatar,tooltip,scroll-banner}.tsx` | swap DaisyUI classes for primitives + semantic classes |
| Create | `src/styles/components/navbar.css` | nav shell layout |

### Risks & Considerations

- Headless UI stays the interaction layer for all dropdowns — do **not** swap to Radix (per decision).
- Navbar is on every page; smoke-test authenticated + anonymous states and mobile breakpoint.
