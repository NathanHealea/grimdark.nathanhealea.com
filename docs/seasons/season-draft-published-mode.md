# Season Draft & Published Mode

**Epic:** Seasons
**Type:** Enhancement
**Status:** In Progress

## Summary

Add draft/published status to the seasons system, mirroring the pattern established in battle reports. When an admin creates a season, it starts in draft mode (visible only to admins). Once the season is ready, the admin can publish it to make it visible on the public seasons page and available for battle report assignment.

## Motivation

Currently, seasons are immediately visible to all users as soon as they're created. This means admins can't prepare a season in advance (setting dates, rules, description) without members seeing an incomplete or premature season. A draft mode lets organizers set up and review a season before making it public — the same workflow that already works well for battle reports.

## Acceptance Criteria

- [ ] Seasons have a `status` field: `draft` or `published`
- [ ] Existing seasons default to `published` (no breaking change)
- [ ] Draft seasons are only visible to admins (enforced by RLS)
- [ ] Public `/seasons` page only shows published seasons
- [ ] Public `/seasons/[id]` detail page returns 404 for draft seasons (non-admin visitors)
- [ ] Admin `/admin/seasons` page shows all seasons with draft/published badges
- [ ] Season form (create/edit) includes a status selector (draft or published)
- [ ] Draft seasons cannot be selected when submitting a battle report (members see only published + active seasons)
- [ ] Admins can change a season from draft to published and vice versa
- [ ] Season leaderboard and battle report counts only include published seasons
- [ ] The `getSeasons()` query supports an `includeAll` parameter (same pattern as battle reports)
- [ ] Active season constraint still applies — only one **published** season can be active at a time

## Approach

Follow the battle report draft/published pattern. The implementation mirrors the same architecture: a `status` column, RLS policies for visibility, conditional query filtering with `includeAll`, and a status selector in the admin form.

### Step 1: Database Migration

Add a `status` column to the `seasons` table.

**Schema changes:**
1. Add column `status text NOT NULL DEFAULT 'published'` with check constraint `status IN ('draft', 'published')`
2. Update the unique active season constraint: only **published** seasons can be active — `UNIQUE (is_active) WHERE is_active = true AND status = 'published'`
3. Add constraint: if `is_active = true`, then `status` must be `'published'` (prevent activating a draft)

**RLS policy changes:**
1. Drop the existing public SELECT policy
2. Add: `Published seasons are publicly readable` — anon and authenticated can read where `status = 'published'`
3. Add: `Admins can view all seasons` — users with admin role can read all seasons regardless of status

### Step 2: TypeScript Types

Update `src/types/season.ts`:
- Add `SeasonStatus` type: `'draft' | 'published'`
- Add `status: SeasonStatus` field to the `Season` type

### Step 3: Query Functions

Update `src/modules/season/queries.ts`:
- Add `includeAll` parameter to `getSeasons()` — when `false` (default), filter by `status = 'published'`; when `true`, return all
- Add `includeAll` parameter to `getActiveSeason()` — active seasons are always published, but maintain the pattern for consistency
- Update `getSeasonById()` — RLS will handle visibility, no app-level filter needed (same as battle report detail)
- No changes to `getNextSeasonNumber()` — numbering includes all seasons regardless of status

### Step 4: Season Form (Admin UI)

Update `src/app/admin/seasons/season-form.tsx`:
- Add status select field (`draft` / `published`) matching the battle report form pattern
- Default to `draft` for new seasons, show current status for edits
- Show help text explaining draft vs. published implications
- Validation: if `is_active` is checked, status must be `published` (with user-friendly error)

### Step 5: Server Actions

Update `src/app/admin/seasons/actions.ts`:
- Handle `status` field from form data in both `createSeason()` and `updateSeason()`
- Validate: cannot set `is_active = true` when `status = 'draft'`
- Include `status` in insert/update payloads

### Step 6: Admin Seasons Page

Update `src/app/admin/seasons/page.tsx`:
- Call `getSeasons()` with `includeAll: true`
- Display status badge column (Draft = warning, Published = success) — same pattern as admin battle reports page

### Step 7: Public Seasons Pages

Update `src/app/seasons/page.tsx`:
- Call `getSeasons()` without `includeAll` (default: published only)
- No other changes needed — draft seasons are already filtered out

Update `src/app/seasons/[id]/page.tsx`:
- RLS handles visibility — if a non-admin navigates to a draft season, the query returns null and the existing `notFound()` call handles it

### Step 8: Battle Report Season Selection

Update battle report form/queries that list available seasons:
- Only show published seasons to members when selecting a season for a battle report
- Admins can still select any season (including drafts) — same override pattern as battle reports

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_add_season_status.sql` | Add `status` column, update constraints, update RLS policies |
| Modify | `src/types/season.ts` | Add `SeasonStatus` type and `status` field |
| Modify | `src/modules/season/queries.ts` | Add `includeAll` parameter to `getSeasons()` |
| Modify | `src/app/admin/seasons/season-form.tsx` | Add status selector to create/edit form |
| Modify | `src/app/admin/seasons/actions.ts` | Handle `status` in create/update actions |
| Modify | `src/app/admin/seasons/page.tsx` | Show all seasons with status badges |
| Modify | `src/app/seasons/page.tsx` | Ensure only published seasons shown (query default) |
| Modify | `src/modules/battle-report/queries.ts` | Filter season options by published status for members |

## Key Decisions

1. **Same pattern as battle reports** — Reusing the `status` column + `includeAll` query parameter + RLS policy pattern keeps the codebase consistent and reduces cognitive load. Admins already understand this pattern from battle reports.

2. **Default to `published` for existing data** — The `DEFAULT 'published'` ensures all current seasons remain visible with no data migration. Only new seasons will use draft mode.

3. **Active requires published** — A draft season cannot be set as active. This prevents members from seeing "no active season" when one exists but is in draft. The constraint is enforced at both the DB level (check constraint) and the form level (validation error).

4. **No partial/nullable fields for drafts** — Unlike battle reports, seasons don't need nullable required fields. All season fields (`start_date`, `end_date`, `battle_points_id`) are simple and fast to fill in. Drafts just control visibility, not completeness.

5. **RLS-based visibility** — Draft visibility is enforced at the database level via RLS policies, not just application code. This provides defense-in-depth, matching the battle report approach.

## Notes

- The `formatSeasonName()` helper in `src/types/season.ts` doesn't need changes — it formats based on `number` and `name`, not status.
- Season numbering (`number` column) should still be assigned to draft seasons — the number is part of identity, not visibility.
- The leaderboard component (`src/modules/leaderboard/components/leaderboard-section.tsx`) may need minor updates if it lists seasons — should only show published seasons in the tab selector.
