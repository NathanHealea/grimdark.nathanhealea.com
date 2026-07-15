# Admin Season Delete

**Epic:** Seasons
**Type:** Feature
**Status:** Completed

## Summary

Admins can delete a season from the season management page and the season edit page. When a season is deleted, any battle reports associated with that season have their `season_id` reference set to NULL rather than being deleted themselves. This preserves battle report data while cleanly removing the season.

## Acceptance Criteria

- [x] Admins can delete a season from the admin seasons list page via the actions menu
- [x] Admins can delete a season from the season edit page via a delete button
- [x] Deleting a season sets `season_id = NULL` on all associated battle reports (not deleted)
- [x] A confirmation dialog is shown before deletion proceeds
- [x] Non-admin users cannot delete seasons (enforced by RLS and app-level checks)
- [x] After deletion, the user is redirected to the admin seasons list with a success message
- [x] The page revalidates so the deleted season no longer appears in any list

## Routes

No new routes. Existing routes modified:

| Route | Description |
|---|---|
| `/admin/seasons` | Add delete action to the actions menu per season |
| `/admin/seasons/[id]/edit` | Add delete button to the edit page |

## Database

### Migration: `supabase/migrations/XXXXXX_add_season_delete_policy.sql`

Add an RLS DELETE policy for the seasons table allowing only admins to delete seasons.

```sql
CREATE POLICY "Admins can delete seasons"
  ON seasons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

### RLS Policies

- **SELECT:** Existing — published seasons public, admins see all
- **INSERT:** Existing — admins only
- **UPDATE:** Existing — admins only
- **DELETE:** **New** — admins only

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/admin/seasons/actions.ts` | Add `deleteSeason` server action |
| Modify | `src/app/admin/seasons/page.tsx` | Add delete option to actions menu |
| Modify | `src/app/admin/seasons/[id]/edit/page.tsx` | Add delete button to edit page |
| Modify | `src/components/actions-menu.tsx` | Extend to support action buttons (not just links) |
| Create | `supabase/migrations/XXXXXX_add_season_delete_policy.sql` | RLS DELETE policy |

### Approach

#### 1. Database migration — RLS DELETE policy

Create a migration that adds a DELETE policy for the seasons table. Only admins (users with the `admin` role in `user_roles`) can delete seasons.

#### 2. Extend ActionsMenu component

The current `ActionsMenu` only supports navigation links (`{ label, href }`). Extend it to also support action buttons:

```typescript
type ActionItem =
  | { label: string; href: string }
  | { label: string; onClick: () => void; variant?: 'danger' }
```

The `variant: 'danger'` option renders the item with error/red styling to indicate a destructive action.

#### 3. Add `deleteSeason` server action

In `src/app/admin/seasons/actions.ts`, add a `deleteSeason` action that:

1. Verifies the user is authenticated and has the admin role
2. Sets `season_id = NULL` on all battle reports referencing the season
3. Deletes the season from the `seasons` table
4. Calls `revalidatePath('/', 'layout')`
5. Returns success/error state

The nullification of `battle_reports.season_id` must happen **before** the season delete to avoid FK constraint violations.

#### 4. Add delete to admin seasons list page

On `src/app/admin/seasons/page.tsx`, add a "Delete Season" option to the `ActionsMenu` for each season row. Since server actions need a client component for the confirmation dialog, wrap the delete trigger in a small client component that:

1. Shows a confirmation dialog (native `confirm()` or a simple modal)
2. On confirm, calls the `deleteSeason` server action
3. Displays success/error feedback

#### 5. Add delete button to season edit page

On `src/app/admin/seasons/[id]/edit/page.tsx`, add a "Delete Season" button (styled as danger/destructive) below the form. Same confirmation pattern as the list page.

## Key Design Decisions

1. **SET NULL instead of CASCADE DELETE** — Battle reports are valuable historical data. Removing a season should orphan the reports (set `season_id = NULL`) rather than deleting them. This matches the user's requirement and preserves data integrity.

2. **Extend ActionsMenu rather than separate delete button on list** — Keeps the UI consistent with the existing pattern. The actions menu already exists on each row; adding a delete option there is the natural UX.

3. **Native `confirm()` for confirmation** — The codebase has no confirmation modal pattern yet. Using the browser's native `confirm()` dialog is the simplest approach that still prevents accidental deletions. A custom modal can be added later if needed.

4. **No soft delete** — A full hard delete is appropriate here. Seasons are admin-managed entities with low volume. The draft/published status already serves as the "hide from users" mechanism. If a season needs to be hidden, it can be set to draft instead of deleted.

## Notes

- The `season.number` column has a UNIQUE constraint. Deleting a season will leave a gap in numbering (e.g., deleting Season 2 leaves 1, 3, 4). This is acceptable — season numbers are identifiers, not sequential counters.
- Consider whether deleting a "current" (active date range) published season should show an extra warning, since it may affect the home page leaderboard display.
