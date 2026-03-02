# Dynamic Meta and Preview Images

**Epic:** Other
**Type:** Enhancement
**Status:** Completed

## Summary

Improve marketing and social sharing by adding page-specific meta descriptions, Open Graph metadata, and dynamically generated preview images for all public-facing pages. When a link to a profile, battle report, or season is shared on Discord/social media, the preview should show content-specific information (player name, battle scores, season details) instead of the generic site branding.

## Motivation

Currently, all pages share the same generic OG image (the Grimdark League branding card) and most pages lack specific descriptions. When members share links to battle reports or profiles in Discord, the preview doesn't convey what the link is about — it just shows the generic site card. Content-specific previews make shared links more engaging and informative, which matters for a community that coordinates primarily through Discord.

Additionally, the sitemap is hardcoded and misses all dynamic routes (profiles, battle reports, seasons), hurting discoverability.

## Acceptance Criteria

- [x] Each static page (`/members`, `/leaderboard`, `/battle-reports`, `/seasons`) has a unique `description` in its metadata
- [x] Profile pages (`/profile/[profileId]`) generate metadata with description including display name, bio excerpt, and faction names
- [x] Profile pages generate a dynamic OG image showing the player's display name and their factions
- [x] Battle report pages (`/battle-reports/[id]`) generate metadata with description including attacker vs defender, scores, and outcome
- [x] Battle report pages generate a dynamic OG image showing attacker vs defender names, factions, scores, and outcome
- [x] Season pages (`/seasons/[id]`) generate metadata with description including season name, date range, and battle size
- [x] Season pages generate a dynamic OG image showing season name, date range, and status (current/past)
- [x] The sitemap dynamically includes all published profiles, published battle reports, and seasons
- [x] All dynamic OG images maintain the existing Grimdark aesthetic (dark background, gold accents, Georgia serif)

## Approach

### Step 1: Create a shared OG image layout component

Extract the existing branded frame (dark bg, gold glow, border accents, corner crosshairs) from `src/app/opengraph-image.tsx` into a reusable layout wrapper that all OG images share. This ensures visual consistency across all preview images.

Create `src/lib/og/og-layout.tsx` — a JSX function that wraps content with the branded frame. All route-level `opengraph-image.tsx` files will import and use this layout.

### Step 2: Enhance static page metadata

Update each static page to export richer metadata with descriptions:

- `/members/page.tsx` — description: "Browse members of the Grimdark League..."
- `/leaderboard/page.tsx` — description: "Current standings and rankings..."
- `/battle-reports/page.tsx` — description: "Battle reports from the Grimdark League..."
- `/seasons/page.tsx` — description: "League seasons for the Grimdark League..."

### Step 3: Enhance profile page metadata + OG image

**Metadata** (`/profile/[profileId]/page.tsx`):
- Expand `generateMetadata` to include `description` with display name, bio excerpt (first ~150 chars), and faction names.
- Add `openGraph` fields: `title`, `description`, `url`.

**OG Image** (`/profile/[profileId]/opengraph-image.tsx`):
- Create a new file using Next.js file-based OG image generation.
- Query profile data: display name, factions.
- Render: branded frame + player name (large, gold) + faction badges listed below.
- Edge runtime, 1200x630 PNG.

### Step 4: Enhance battle report page metadata + OG image

**Metadata** (`/battle-reports/[id]/page.tsx`):
- Expand `generateMetadata` to include `description` with attacker name, defender name, scores, and outcome.
- Add `openGraph` fields: `title`, `description`, `url`.

**OG Image** (`/battle-reports/[id]/opengraph-image.tsx`):
- Query battle report + profiles + factions.
- Render: branded frame + "Battle Report" header + attacker side (name, faction, score) vs defender side (name, faction, score) + outcome indicator.
- Edge runtime, 1200x630 PNG.

### Step 5: Enhance season page metadata + OG image

**Metadata** (`/seasons/[id]/page.tsx`):
- Expand `generateMetadata` to include `description` with season name, date range, battle size, and current/past status.
- Add `openGraph` fields: `title`, `description`, `url`.

**OG Image** (`/seasons/[id]/opengraph-image.tsx`):
- Query season data.
- Render: branded frame + season name (large) + date range + battle size + "Current Season" badge if applicable.
- Edge runtime, 1200x630 PNG.

### Step 6: Make the sitemap dynamic

Update `src/app/sitemap.ts` to query the database for:
- All profiles (public) → `/profile/[profileId]` entries
- All published battle reports → `/battle-reports/[id]` entries
- All seasons → `/seasons/[id]` entries

Keep the existing static routes. Use `lastModified` from the records' `updated_at` or `created_at` timestamps.

### Step 7: Add twitter-image files for dynamic routes

For each route that gets a new `opengraph-image.tsx`, re-export it as `twitter-image.tsx` (matching the existing pattern in `src/app/twitter-image.tsx`).

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `src/lib/og/og-layout.tsx` | Shared branded OG image frame layout |
| Modify | `src/app/opengraph-image.tsx` | Refactor to use shared layout |
| Modify | `src/app/members/page.tsx` | Add description metadata |
| Modify | `src/app/leaderboard/page.tsx` | Add description metadata |
| Modify | `src/app/battle-reports/page.tsx` | Add description metadata |
| Modify | `src/app/seasons/page.tsx` | Add description metadata |
| Modify | `src/app/profile/[profileId]/page.tsx` | Expand generateMetadata with description + OG fields |
| Create | `src/app/profile/[profileId]/opengraph-image.tsx` | Dynamic profile OG image |
| Create | `src/app/profile/[profileId]/twitter-image.tsx` | Re-export OG image for Twitter |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Expand generateMetadata with description + OG fields |
| Create | `src/app/battle-reports/[id]/opengraph-image.tsx` | Dynamic battle report OG image |
| Create | `src/app/battle-reports/[id]/twitter-image.tsx` | Re-export OG image for Twitter |
| Modify | `src/app/seasons/[id]/page.tsx` | Expand generateMetadata with description + OG fields |
| Create | `src/app/seasons/[id]/opengraph-image.tsx` | Dynamic season OG image |
| Create | `src/app/seasons/[id]/twitter-image.tsx` | Re-export OG image for Twitter |
| Modify | `src/app/sitemap.ts` | Dynamic sitemap with all public routes |

## Key Decisions

1. **File-based OG image generation over API routes** — Next.js supports `opengraph-image.tsx` files co-located with pages. This is cleaner than manual API routes, automatically sets the correct `og:image` meta tag, and benefits from built-in caching.

2. **Shared layout wrapper over copy-paste** — Extract the branded frame into a reusable component so all OG images share the same aesthetic without duplicating ~80 lines of JSX per route.

3. **Edge runtime for OG images** — Matches the existing pattern in `src/app/opengraph-image.tsx`. Edge runtime is required by `next/og` `ImageResponse` and provides fast generation at the edge.

4. **No avatar images in OG cards** — OG image generation on edge runtime has limited ability to fetch and embed external images (avatar URLs from Supabase storage). Keep OG images text-based with the branded frame for reliability. Can revisit later.

5. **Skip draft battle reports in sitemap** — Only include published battle reports in the sitemap since drafts are private content.

## Notes

- `next/og` uses Satori under the hood for JSX → SVG → PNG rendering. It supports a subset of CSS (flexbox only, no grid). All OG image layouts must use flexbox.
- The existing OG image already uses inline styles (required by Satori) — all new OG images will follow the same pattern.
- Font loading: the existing image uses `Georgia, serif` as a system font fallback. Custom font loading (e.g., Geist) in edge OG images requires fetching font files — keep Georgia for simplicity unless the user wants custom fonts.
- Test OG images locally at `http://localhost:3000/profile/1/opengraph-image` etc. — Next.js serves them as image endpoints.
