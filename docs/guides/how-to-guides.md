# How-To Guides

**Epic:** Guides
**Type:** Feature
**Status:** In Progress

## Summary

Add a markdown-based how-to guides system at `/guides`. Members and visitors can browse guides on core league actions: joining a season, setting up a profile, and submitting battle reports. Guides are authored as `.md` files in `src/content/guides/` with frontmatter metadata, rendered with custom `react-markdown` component overrides styled to match the existing grimdark theme, and linked from both the main navigation and contextual spots on feature pages.

Guides support a hierarchical role-based visibility system via a `role` frontmatter field:
- **Public** (`role: null`) — Visible to all visitors, no auth required
- **Member** (`role: "member"`) — Visible to members, organizers, and admins
- **Organizer** (`role: "organizer"`) — Visible to organizers and admins
- **Admin** (`role: "admin"`) — Visible only to admins

The hierarchy is cumulative: higher roles inherit access to all lower-role guides.

## Acceptance Criteria

- [x] `/guides` page lists all available guides with title, description, and category
- [x] `/guides/[slug]` renders a single guide with full markdown support (headings, lists, links, bold/italic, blockquotes, code)
- [x] "Guides" link appears in the main navigation (desktop and mobile)
- [x] Guide content is authored as `.md` files in `src/content/guides/` with frontmatter (title, description, category, order)
- [x] Three initial guides are created: joining a season, setting up your profile, submitting a battle report
- [x] Internal links between guides use Next.js Link for client-side navigation
- [x] External links open in a new tab
- [x] Contextual "How to" links appear on the seasons detail page and battle reports page
- [x] Pages have proper metadata (title, description) from frontmatter for SEO
- [ ] Build succeeds with static generation (`generateStaticParams`)
- [x] Public guides (`role: null`) are accessible to all visitors (no auth required)
- [x] Member guides (`role: "member"`) are visible to authenticated members, organizers, and admins
- [x] Organizer guides (`role: "organizer"`) are visible to organizers and admins only
- [x] Admin guides (`role: "admin"`) are visible only to admins
- [x] Role-restricted guides do not appear in the `/guides` index for unauthorized users
- [x] Accessing a role-restricted guide slug directly redirects unauthorized users to `/guides`

## Routes

| Route | Description |
|---|---|
| `/guides` | Index page listing all available how-to guides |
| `/guides/[slug]` | Individual guide page rendered from markdown |

## Database

No database changes required. Guides are static markdown files.

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Install | `package.json` | Add `gray-matter` |
| Create | `src/content/guides/joining-a-season.md` | Guide: How to Join a Season |
| Create | `src/content/guides/setting-up-your-profile.md` | Guide: How to Set Up Your Profile |
| Create | `src/content/guides/submitting-a-battle-report.md` | Guide: How to Submit a Battle Report |
| Create | `src/types/guide.ts` | TypeScript type for guide metadata |
| Create | `src/lib/content.ts` | Utility to read/parse markdown files from filesystem |
| Create | `src/modules/guides/components/guide-content.tsx` | Markdown renderer with custom component overrides for guide pages |
| Create | `src/app/guides/page.tsx` | Guides index page |
| Create | `src/app/guides/[slug]/page.tsx` | Individual guide page with `generateStaticParams` |
| Modify | `src/routes.ts` | Add "Guides" to `publicLinks` |
| Modify | `src/app/seasons/[id]/page.tsx` | Add contextual link to joining guide |
| Modify | `src/app/battle-reports/page.tsx` | Add contextual link to submit guide |

### Approach

#### 1. Install dependencies

Install `gray-matter` for frontmatter parsing. No typography plugin needed — guide content will use custom `react-markdown` component overrides styled with existing Tailwind utilities and the grimdark theme classes from `globals.css`.

#### 2. Create content directory and markdown guides

Create `src/content/guides/` with three `.md` files. Each uses frontmatter:

```yaml
---
title: "How to Join a Season"
description: "Sign up for a league season and pick your faction"
category: "Seasons"
order: 1
role: null  # or "member" | "organizer" | "admin" to restrict access
---
```

The filename (minus `.md`) becomes the URL slug.

#### 3. Create content utility

`src/lib/content.ts` with:
- `getGuides(userRoles?: string[])` — Read all `.md` files, parse frontmatter with `gray-matter`, filter by role hierarchy (public < member < organizer < admin), return metadata sorted by `order`
- `getGuide(slug, userRoles?: string[])` — Read single guide, return metadata + markdown content. Returns `null` if user lacks required role per hierarchy
- `canAccessGuide(guideRole, userRoles)` — Check if user's roles grant access per the hierarchy: admins see all, organizers see organizer/member/public, members see member/public, visitors see public only
- `getGuideSlugs()` — Return all slugs for `generateStaticParams` (no filtering — all pages are generated, access checked at render time)

Uses `fs.readFileSync` and `path.join(process.cwd(), 'src/content/guides')` — standard pattern for server components.

#### 4. Create guide content component

`src/modules/guides/components/guide-content.tsx` wraps `react-markdown` (already installed) in an `<article>` with custom component overrides styled using Tailwind utility classes matching the grimdark theme:
- `h1`–`h6` — Use existing typography classes from `globals.css` (`.text-h1`, etc.) with appropriate margins
- `p` — `text-base text-base-content/70` (matches existing body text)
- `a` — Next.js `Link` for internal paths with `text-primary` styling, `<a target="_blank">` for external
- `ul`, `ol`, `li` — Styled lists with proper indentation and markers
- `blockquote` — Left border with `border-primary`, muted background
- `code` — Inline code with `bg-base-300 rounded px-1`, code blocks with `bg-base-300 rounded-box p-4 overflow-x-auto`
- `hr` — Ornamental divider matching the existing `.ornament` pattern
- `table` — Use existing `.data-table` pattern or matching styles

This is separate from the existing `MarkdownRenderer` (used for bios/descriptions) which stays minimal.

#### 5. Create `/guides` index page

Server component. Fetches the current user's roles (if authenticated) and passes them to `getGuides(userRoles)` so role-restricted guides are filtered out. Displays cards with title, description, and category badge. Follows existing `page-layout` / `page-container` / `page-content` pattern.

#### 6. Create `/guides/[slug]` dynamic page

Server component with `generateStaticParams` from `getGuideSlugs()` (all pages are statically generated). At render time, checks the user's roles against the guide's `role` frontmatter — if unauthorized, redirects to `/guides`. Dynamic metadata from frontmatter. Back link to `/guides`. Rendered guide content.

#### 7. Add "Guides" to navigation

Add `{ href: '/guides', label: 'Guides' }` to `publicLinks` in `src/routes.ts`. Automatically appears in desktop navbar and mobile nav drawer.

#### 8. Add contextual links on feature pages

Subtle helper links (e.g., `BookOpenIcon` + text) on:
- `/seasons/[id]` — near the roster/join section
- `/battle-reports` — near the page header or empty state

## Key Design Decisions

1. **Static markdown files over database-stored content** — Guides are authored by developers, not end users. File-based content is versioned in git, requires no database schema, and statically generates at build time for fast loads.
2. **Separate guide renderer from existing MarkdownRenderer** — The existing renderer handles short-form content (bios, descriptions) with minimal styling. Guides need full markdown support (headings, tables, code blocks). Keeping them separate avoids bloating the simple renderer.
3. **Custom `react-markdown` component overrides over `@tailwindcss/typography`** — Custom component overrides styled with Tailwind utilities give full control over the grimdark theme appearance. This avoids adding a dependency and keeps typography consistent with the existing hand-crafted styles in `globals.css`.
4. **Frontmatter with `gray-matter` over a separate metadata file** — Co-locating metadata (title, description, order, role) with content is the standard pattern for markdown-based content systems. `gray-matter` is lightweight and widely used.
5. **Hierarchical role-based access control** — Guides default to public. The `role` frontmatter field supports four levels: `null` (public), `"member"`, `"organizer"`, `"admin"`. Access is hierarchical — admins see everything, organizers see organizer/member/public, members see member/public, visitors see only public. The content utility implements this hierarchy, and the `[slug]` page redirects unauthorized access.

## Notes

- The existing `MarkdownRenderer` at `src/modules/markdown/components/markdown-renderer.tsx` is left unchanged — it serves a different purpose (short-form bio/description rendering).
- Future guides can be added by simply creating a new `.md` file in `src/content/guides/` with the proper frontmatter — no code changes needed.
- If the number of guides grows significantly, categories could be used to group them on the index page.
