# Battle Report Player Selection Refactor

**Epic:** Battle Reports
**Type:** Feature
**Status:** Todo

## Summary

Refactor the battle report submission form so that player selection is context-aware. When no season is selected, any profile with a member or organizer role can be selected as a player. When a season is selected, only profiles that are active participants in that season are available. This ensures battle reports accurately reflect who is eligible to play in each context.

## Acceptance Criteria

### Player Selection Without Season

- [ ] When no season is active (or the season field is unset), the player dropdowns show all profiles with role `member` or `organizer`
- [ ] Both linked and unlinked profiles appear in the dropdown
- [ ] Players are sorted alphabetically by display name

### Player Selection With Season

- [ ] When a season is selected, the player dropdowns filter to only show profiles that are active participants in that season
- [ ] If the selected season has no participants, the dropdowns are empty with an appropriate message
- [ ] Changing the season selection refreshes the available player list
- [ ] If a previously selected player is not in the new season, the selection is cleared

### Season Selection on Form

- [ ] The battle report form includes a season selector
- [ ] The active season (if any) is pre-selected by default
- [ ] Admins can select any season or "No Season" to submit an unscoped report
- [ ] The season is saved on the battle report as `season_id`

### Existing Behavior

- [ ] The existing auto-assignment trigger (active season assigned on insert) continues to work as a fallback
- [ ] Battle reports submitted without a season selection still work
- [ ] Server-side validation ensures selected players belong to the chosen season (if one is selected)

## Routes

No new routes. Modifications to the existing submit page.

| Route | Description |
|---|---|
| `/battle-reports/submit` | Modified — adds season selector, context-aware player filtering |

## Database

No schema changes needed. The `battle_reports.season_id` column already exists (nullable FK to seasons). The `season_participants` table (from the Season Participants feature) provides the data for filtering.

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/battle-reports/submit/page.tsx` | Fetch seasons and season participants, pass to form |
| Modify | `src/app/battle-reports/submit/battle-report-form.tsx` | Add season selector, filter players by season |
| Modify | `src/app/battle-reports/submit/actions.ts` | Accept `season_id`, validate players belong to season |
| Modify | `src/modules/battle-report/queries.ts` | Add `getSeasonParticipants()` query |

### Approach

#### 1. Fetch Season Data

In the submit page server component, fetch seasons and season participants alongside existing data:

```ts
const [missions, deployments, battlePoints, members, factions, memberFactions, seasons, seasonParticipants] =
  await Promise.all([
    getMissions(),
    getDeployments(),
    getBattlePoints(),
    getMembers(),            // all member/organizer profiles (for no-season mode)
    getFactions(),
    getMemberFactions(),
    getSeasons(),
    getSeasonParticipants(), // all season-profile associations
  ])
```

Pass `seasons`, `seasonParticipants`, and the active season to the form.

#### 2. Season Selector

Add a season select field at the top of the form (in the Game Details section, before Mission):

- Options: "No Season" + all seasons (active season pre-selected)
- When changed, filter the player dropdowns
- Store selected season ID in form state

#### 3. Client-Side Player Filtering

Build a Map of `seasonId → Set<profileId>` from the `seasonParticipants` prop.

When a season is selected:
- Filter `members` to only those whose `id` is in the season's participant set
- If the currently selected attacker/defender is not in the filtered list, clear the selection

When no season is selected:
- Show all members (current behavior)

#### 4. Server Action Update

In `submitBattleReport`:

1. Accept optional `season_id` from form data
2. If `season_id` is provided:
   - Validate the season exists
   - Validate both `attacker_id` and `defender_id` are participants of that season
3. Include `season_id` in the battle report insert (overrides the auto-assign trigger)

#### 5. Validation

```ts
// Server-side: if season selected, verify players are participants
if (seasonId) {
  const { data: participants } = await supabase
    .from('season_participants')
    .select('profile_id')
    .eq('season_id', seasonId)

  const participantIds = new Set(participants?.map(p => p.profile_id))

  if (!participantIds.has(attackerId)) {
    errors.attacker_id = 'Attacker is not a participant in the selected season.'
  }
  if (!participantIds.has(defenderId)) {
    errors.defender_id = 'Defender is not a participant in the selected season.'
  }
}
```

## Key Design Decisions

1. **All members shown when no season** — Without a season context, any member/organizer can play. This supports casual games outside of organized seasons.

2. **Season participants for filtering, not restriction** — The season filter narrows the dropdown for convenience and accuracy, but admins can always select "No Season" to bypass it. This avoids blocking legitimate reports.

3. **Client-side filtering with server-side validation** — The dropdown filtering happens client-side for responsiveness. Server-side validation ensures data integrity even if the client is bypassed.

4. **Pre-select active season** — Most battle reports will be for the current active season. Pre-selecting it reduces clicks while still allowing override.

## Notes

- **Depends on:** Season Participants feature (the `season_participants` table must exist).
- The existing auto-assign trigger (`on_battle_report_assign_season`) sets `season_id` to the active season on insert. When the form explicitly provides a `season_id`, the insert value takes precedence over the trigger's `COALESCE(NEW.season_id, active_season)` logic.
- The `memberFactions` filtering (showing only factions the selected player has) continues to work independently of season filtering.
