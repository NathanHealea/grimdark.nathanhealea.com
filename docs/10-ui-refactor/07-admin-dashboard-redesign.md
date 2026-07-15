# Admin Dashboard Redesign

**Epic:** UI Refactor
**Type:** Feature
**Status:** Todo
**Merge Into:** epic/ui-refactor

## Summary

**Exception to the visual-parity rule.** Rebuild the admin section as a proper dashboard modeled on the `../grimify` (`grimify.app`) conventions: a flex sidebar shell with array-driven route-aware navigation and a mobile hamburger drawer, a Card stat-tile dashboard landing page, and hand-rolled data tables. All admin CRUD functionality is preserved; only the layout, structure, and styling change. Depends on docs 01–03.

## Acceptance Criteria

- [ ] **Shell:** an admin layout renders `flex min-h-[calc(100vh-4rem)]` with a `w-60` desktop sidebar (`lg:flex`, hidden on mobile) + a flex-1 content column; a mobile-only topbar holds a hamburger that toggles a `fixed` overlay drawer; `<main>` is `p-6 overflow-auto`.
- [ ] **Sidebar:** nav defined as a `NAV_ITEMS` array (Dashboard, User Management, Seasons, Editions, Battle Reports) with route-aware active state via `usePathname()`; active item styled `bg-muted font-medium text-foreground`.
- [ ] **Dashboard landing (`admin/page.tsx`):** a `PageHeader` + a responsive Card stat-tile grid (`sm:grid-cols-2 lg:grid-cols-3`, `CardDescription` label over `text-2xl` `CardTitle` number) driven by real counts (members, battle reports, seasons, editions), plus a recent-activity card.
- [ ] **Tables:** admin lists (`user-management-table`, editions/seasons/deployments/missions/force-dispositions lists, `roster-manager`) rebuilt as hand-rolled tables wrapped in `overflow-x-auto rounded-lg border border-border`, `bg-muted/50` header, `px-4 py-3` cells, with ghost/destructive `btn-sm` row actions. Existing `ActionsMenu` (Headless UI) retained for row menus.
- [ ] **Forms:** all admin forms (`edition-form`, `season-form`, `create-profile-form`, `admin-edit-profile-form`, deployment/mission/force-disposition forms, delete buttons) migrated to the primitives; the DaisyUI `dropdown` in `admin-edit-profile-form.tsx` replaced with the shared `ActionsMenu`/Headless UI pattern.
- [ ] `admin-menu.tsx` integrates with the new shell (or is superseded by the sidebar as appropriate).
- [ ] Every admin action (create/edit/delete/role changes/roster management) works exactly as before; access control unchanged. `npm run build` + `npm run lint` pass.

## Approach

1. Build the shell: `admin/layout.tsx` → `admin-layout-client.tsx` (sidebar open state) + `admin-sidebar.tsx` (`NAV_ITEMS`, active state, desktop `aside` + mobile drawer). Add `sidebar.css`.
2. Build the dashboard landing page with parallel count queries and the Card stat-tile grid + recent-activity card. Add `page-header` component/styles if not already present.
3. Create a reusable admin table pattern and rebuild each list.
4. Migrate the admin forms and delete buttons onto the primitives; replace the lone DaisyUI `dropdown`.
5. Verify against `../grimify/src/modules/admin/` for layout/patterns.

### Affected Files

| Action | File | Changes |
|---|---|---|
| Modify | `src/app/admin/layout.tsx` | render dashboard shell |
| Create | `src/modules/admin/components/{admin-layout-client,admin-sidebar}.tsx` | shell + nav |
| Create | `src/styles/components/sidebar.css` | sidebar/drawer styles |
| Modify | `src/app/admin/page.tsx` | dashboard landing (stat tiles + recent activity) |
| Modify | `src/app/admin/**/*.tsx` | tables + forms → dashboard patterns/primitives |
| Modify | `src/components/admin-menu.tsx` | integrate with shell |

### Risks & Considerations

- Largest surface in the epic and the only one that intentionally changes appearance — confirm every CRUD flow still works after the visual rebuild.
- Keep `ActionsMenu` (Headless UI) for row/action menus; do not introduce Radix dropdowns.
- Mirror grimify structure but reuse this project's modules (`admin` module under `src/modules/`).

## Notes

Primary reference: `../grimify/src/app/admin/` and `../grimify/src/modules/admin/components/` (shell, sidebar, dashboard, list tables), plus `../grimify/DESIGN.md`.
