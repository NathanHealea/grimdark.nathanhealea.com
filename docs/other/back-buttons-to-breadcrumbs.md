# Replace Back Buttons with Breadcrumbs

**Epic:** Other
**Type:** Enhancement
**Status:** Todo

## Summary

Replace all 11 back buttons (`.btn-back`) across seasons, profiles, battle report, and admin pages with a reusable breadcrumb component. Breadcrumbs show the full navigation trail as small buttons, with links only accessible to users who have permission to the target page (e.g., admin-only links are unclickable for non-admins).

## Motivation

Back buttons only show a single parent link, giving no context about where you are in the navigation hierarchy. Breadcrumbs provide a full trail (e.g., Admin > Seasons > Edit Season), making it easier to navigate laterally and understand page context. Permission-gating the links ensures users don't hit dead ends when clicking breadcrumbs they can't access.

## Acceptance Criteria

- [ ] A reusable `Breadcrumbs` component exists at `src/components/breadcrumbs.tsx`
- [ ] All 11 existing `.btn-back` usages are replaced with breadcrumbs
- [ ] Breadcrumbs show the full navigation trail (e.g., Seasons > Season Name > Edit)
- [ ] Each breadcrumb segment is rendered as a small button (`btn btn-ghost btn-sm`)
- [ ] Segments are separated by a chevron or `/` delimiter
- [ ] Admin-route breadcrumb links are only clickable for users with the admin role
- [ ] Non-admin users see admin breadcrumb segments as plain text (not links)
- [ ] Public-route breadcrumb links are always clickable
- [ ] The current page (last segment) is displayed as plain text, not a link
- [ ] The `.btn-back` CSS class is removed from `globals.css` after all usages are replaced
- [ ] Build and lint pass

## Approach

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `src/components/breadcrumbs.tsx` | Reusable breadcrumb component |
| Modify | `src/app/globals.css` | Remove `.btn-back` class |
| Modify | `src/app/battle-reports/submit/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/battle-reports/drafts/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/battle-reports/[id]/edit/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/profile/[profileId]/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/profile/edit/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/seasons/[id]/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/admin/user-management/create/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/admin/user-management/[profileId]/edit/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/admin/seasons/new/page.tsx` | Replace back button with breadcrumbs |
| Modify | `src/app/admin/seasons/[id]/edit/page.tsx` | Replace back button with breadcrumbs |

### 1. Create the `Breadcrumbs` component

Create `src/components/breadcrumbs.tsx` as a server component.

**Props:**
```
type BreadcrumbItem = {
  label: string
  href?: string
  adminOnly?: boolean
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}
```

**Behavior:**
- Accepts an array of breadcrumb items. The last item is the current page (rendered as plain text).
- For each item except the last:
  - If `adminOnly` is true, check the user's role. If admin, render as a `<Link>`. If not admin, render as plain text.
  - If `adminOnly` is false/undefined, render as a `<Link>`.
- Styling: each link is `btn btn-ghost btn-xs` (smaller than the old `.btn-back`). Segments separated by `ChevronRightIcon` from `@heroicons/react`.
- Container: `flex items-center gap-1 mb-4 -ml-2` (similar positioning to old `.btn-back`).

**Permission check:** The component needs to know if the current user is an admin. Since it's a server component, call `getAuthUser()` and `hasRole()` internally. To avoid redundant DB calls, only perform the check if any item has `adminOnly: true`.

### 2. Replace back buttons on public pages (no admin check needed)

Replace the `<Link className="btn-back">` on these pages with `<Breadcrumbs>`:

| Page | Route | Old back button | New breadcrumbs |
|---|---|---|---|
| `battle-reports/submit/page.tsx` | `/battle-reports/submit` | ← All Battle Reports | Battle Reports > Submit Report |
| `battle-reports/drafts/page.tsx` | `/battle-reports/drafts` | ← All Battle Reports | Battle Reports > My Drafts |
| `battle-reports/[id]/page.tsx` | `/battle-reports/[id]` | ← All Battle Reports | Battle Reports > {report label} |
| `battle-reports/[id]/edit/page.tsx` | `/battle-reports/[id]/edit` | ← View report | Battle Reports > {report label} > Edit |
| `profile/[profileId]/page.tsx` | `/profile/[profileId]` | ← All Members | Members > {display name} |
| `profile/edit/page.tsx` | `/profile/edit` | ← View Profile | Members > {display name} > Edit |
| `seasons/[id]/page.tsx` | `/seasons/[id]` | ← All Seasons | Seasons > {season name} |

### 3. Replace back buttons on admin pages (admin check needed)

These pages are already admin-only (middleware enforced), so all breadcrumb segments can be links. However, the `adminOnly` flag is still set so the component works correctly if reused elsewhere.

| Page | Route | Old back button | New breadcrumbs |
|---|---|---|---|
| `admin/user-management/create/page.tsx` | `/admin/user-management/create` | ← User Management | User Management > Create Profile |
| `admin/user-management/[profileId]/edit/page.tsx` | `/admin/user-management/[profileId]/edit` | ← View Profile | Members > {display name} > Edit (admin) |
| `admin/seasons/new/page.tsx` | `/admin/seasons/new` | ← Back to Seasons | Season Management > New Season |
| `admin/seasons/[id]/edit/page.tsx` | `/admin/seasons/[id]/edit` | ← Back to Seasons | Season Management > {season name} > Edit |

### 4. Remove `.btn-back` from `globals.css`

After all 11 usages are replaced, delete the `.btn-back` class definition from `src/app/globals.css` (lines 259-261).

### 5. Build and lint verification

Run `npm run build` and `npm run lint` to confirm everything compiles.

## Key Decisions

1. **Server component for permission checks** — The `Breadcrumbs` component is a server component so it can check admin roles server-side without exposing role data to the client. This keeps the permission logic secure and avoids client-side flicker.
2. **`adminOnly` flag per segment** — Rather than a blanket "is this an admin page" check, each breadcrumb item can independently declare whether it requires admin access. This supports mixed trails (e.g., public Members page linking to an admin Edit page).
3. **`btn-ghost btn-xs` styling** — Uses DaisyUI's extra-small ghost button class to keep breadcrumbs compact and unobtrusive, consistent with the existing navigation style.
4. **ChevronRightIcon separators** — Uses the existing `@heroicons/react` library already in the project rather than text separators, for a cleaner look.

## Notes

- The middleware already redirects non-admin users away from `/admin/*` routes, so the `adminOnly` breadcrumb gating is a UI refinement — it prevents showing clickable links to pages the user would be redirected from.
- Pages without back buttons (listing pages like `/battle-reports`, `/seasons`, `/members`, admin management pages) do not need breadcrumbs — they are top-level pages.
