# Season Roster

**Epic:** Seasons
**Type:** Feature
**Status:** Completed

## Summary

Allow members to sign up for a season and select the army (faction) they plan to play. Admins and organizers can also manage the roster — adding or removing any profile and setting their faction. The roster is publicly visible on the season detail page, showing who's playing and what army they're bringing.

This supersedes the earlier `season-participants.md` plan by adding member self-signup and faction selection.

## Acceptance Criteria

### Member Self-Signup

- [x] Authenticated members can join a published season from the season detail page
- [x] When joining, the member must select a faction (army) they plan to play
- [x] Members can leave a season they've joined
- [x] Members can update their faction selection for a season they're in
- [x] Members cannot join the same season twice (no duplicates)
- [x] Only published seasons can be joined (not drafts)

### Admin/Organizer Management

- [x] Admins and organizers can view the full roster for any season
- [x] Admins and organizers can add any profile (linked or unlinked) to a season with a faction
- [x] Admins and organizers can remove any participant from a season
- [x] Admins and organizers can change a participant's faction
- [x] Adding an already-enrolled participant is a no-op (no error)

### Public Display

- [x] The season detail page (`/seasons/[id]`) shows the roster section
- [x] Each roster entry displays the player's avatar, display name, and faction
- [x] Participant count is shown on the season card on the seasons list page
- [x] The roster is visible to all visitors (public data)

### Data Model

- [x] A `season_roster` join table links profiles to seasons with a faction
- [x] A profile can participate in multiple seasons
- [x] A season can have multiple participants
- [x] Each participant has exactly one faction per season
- [x] Deleting a profile cascades and removes their roster entries
- [x] Deleting a season cascades and removes all roster entries for that season

### Build

- [x] Build and lint pass

## Routes

| Route | Description |
|---|---|
| `/seasons/[id]` | Modified — shows roster section with join/leave for members |
| `/admin/seasons/[id]/edit` | Modified — includes roster management section |

## Database

### Migration: `supabase/migrations/XXXXXX_create_season_roster.sql`

```sql
-- Season roster join table (profiles enrolled in a season with their army)
CREATE TABLE public.season_roster (
  season_id integer NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  faction_id text NOT NULL REFERENCES public.factions(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (season_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.season_roster ENABLE ROW LEVEL SECURITY;

-- Anyone can read the roster (public data)
CREATE POLICY "Season roster is publicly readable"
  ON public.season_roster
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Members can add themselves to published seasons
CREATE POLICY "Members can join published seasons"
  ON public.season_roster
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be adding own profile
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    -- Season must be published
    AND EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = season_id AND s.status = 'published'
    )
  );

-- Members can update their own faction
CREATE POLICY "Members can update own roster entry"
  ON public.season_roster
  FOR UPDATE
  TO authenticated
  USING (
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Members can remove themselves
CREATE POLICY "Members can leave a season"
  ON public.season_roster
  FOR DELETE
  TO authenticated
  USING (
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Admins and organizers can manage all roster entries
CREATE POLICY "Admins and organizers can insert roster entries"
  ON public.season_roster
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Admins and organizers can update roster entries"
  ON public.season_roster
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Admins and organizers can delete roster entries"
  ON public.season_roster
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );
```

### RLS Policies

- **SELECT:** Public — anyone can see the roster
- **INSERT:** Members can add themselves (published seasons only); admins/organizers can add anyone
- **UPDATE:** Members can update their own faction; admins/organizers can update any entry
- **DELETE:** Members can remove themselves; admins/organizers can remove anyone

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_create_season_roster.sql` | New table, RLS policies |
| Create | `src/app/seasons/[id]/roster-actions.ts` | Server actions: `joinSeason`, `leaveSeason`, `updateRosterFaction` |
| Create | `src/app/seasons/[id]/join-season-form.tsx` | Client component: join form with faction selector |
| Create | `src/app/seasons/[id]/season-roster.tsx` | Server component: displays the roster list |
| Create | `src/app/admin/seasons/[id]/edit/roster-manager.tsx` | Client component: admin roster management |
| Create | `src/app/admin/seasons/[id]/edit/roster-actions.ts` | Server actions: `addParticipant`, `removeParticipant`, `updateParticipantFaction` |
| Modify | `src/app/seasons/[id]/page.tsx` | Add roster section between rules and leaderboard |
| Modify | `src/app/seasons/page.tsx` | Show participant count on season cards |
| Modify | `src/app/admin/seasons/[id]/edit/page.tsx` | Add roster manager section |
| Modify | `src/modules/season/queries.ts` | Add roster query functions |
| Modify | `src/types/season.ts` | Add `SeasonRosterEntry` type |

### Approach

#### 1. Database Migration

Create the `season_roster` table with composite PK `(season_id, profile_id)` and a required `faction_id` FK. RLS policies allow public reads, member self-management, and admin/organizer full management. The composite PK prevents duplicates and enables `ON CONFLICT DO NOTHING` for idempotent admin inserts.

#### 2. Types and Queries

Add to `src/types/season.ts`:

```ts
export type SeasonRosterEntry = {
  season_id: number
  profile_id: string
  faction_id: string
  joined_at: string
}
```

Add queries to `src/modules/season/queries.ts`:

```ts
// Get roster for a season with profile + faction data
export async function getSeasonRoster(seasonId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('season_roster')
    .select('season_id, profile_id, faction_id, joined_at, profiles(id, display_name, avatar_url, profile_id)')
    .eq('season_id', seasonId)
    .order('joined_at')
  return data ?? []
}

// Get participant counts per season (for season list cards)
export async function getSeasonRosterCounts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('season_roster')
    .select('season_id')
  const counts = new Map<number, number>()
  for (const row of data ?? []) {
    counts.set(row.season_id, (counts.get(row.season_id) ?? 0) + 1)
  }
  return counts
}
```

#### 3. Member Self-Signup (Season Detail Page)

On `/seasons/[id]`, add a **Roster** section between Rules and Leaderboard:

- **Roster list** — Grid of participant cards showing avatar, display name, and faction label. Visible to everyone.
- **Join form** — Visible to authenticated members who are NOT already on the roster. Contains a faction selector (reuse existing `FactionSelector` pattern but for single selection) and a "Join Season" button. Calls `joinSeason` server action.
- **Leave button** — Visible to members who ARE on the roster. Calls `leaveSeason` server action with confirmation.
- **Update faction** — Members on the roster can click their faction to change it. Calls `updateRosterFaction` server action.

Server actions in `src/app/seasons/[id]/roster-actions.ts`:

```ts
'use server'

export async function joinSeason(seasonId: number, factionId: string) {
  // Auth check, get user's profile
  // Verify season is published
  // Insert into season_roster
  // revalidatePath
}

export async function leaveSeason(seasonId: number) {
  // Auth check, get user's profile
  // Delete from season_roster where season_id + profile_id
  // revalidatePath
}

export async function updateRosterFaction(seasonId: number, factionId: string) {
  // Auth check, get user's profile
  // Update season_roster set faction_id where season_id + profile_id
  // revalidatePath
}
```

#### 4. Admin/Organizer Roster Management

On the season edit page (`/admin/seasons/[id]/edit`), add a **Roster** section below the form:

- **Current roster** — Table of participants with avatar, display name, faction, and actions (change faction, remove).
- **Add participant** — Select a profile from all members/organizers not yet on the roster, select a faction, and click "Add". Calls `addParticipant` server action.
- **Remove participant** — Remove button per row with confirmation. Calls `removeParticipant` server action.

Server actions in `src/app/admin/seasons/[id]/edit/roster-actions.ts`:

```ts
'use server'

export async function addParticipant(seasonId: number, profileId: string, factionId: string) {
  // Auth check (admin or organizer via hasAnyRole)
  // Insert into season_roster ON CONFLICT DO NOTHING
  // revalidatePath
}

export async function removeParticipant(seasonId: number, profileId: string) {
  // Auth check (admin or organizer)
  // Delete from season_roster
  // revalidatePath
}

export async function updateParticipantFaction(seasonId: number, profileId: string, factionId: string) {
  // Auth check (admin or organizer)
  // Update season_roster set faction_id
  // revalidatePath
}
```

#### 5. Season List Page

On `/seasons`, fetch roster counts and display alongside battle report counts on each season card:

```tsx
<span>{rosterCount} {rosterCount === 1 ? 'player' : 'players'}</span>
```

#### 6. Faction Selector (Single-Select Variant)

The existing `FactionSelector` component supports multi-select (for profile factions). For the roster, we need a **single-select** variant — a simple `<select>` dropdown with the hierarchical faction tree. This can either be a new prop on the existing component or a simpler standalone select.

### Implementation Steps

1. **Database migration** — Create `season_roster` table with RLS
2. **Types + queries** — Add `SeasonRosterEntry` type and query functions
3. **Member roster actions** — `joinSeason`, `leaveSeason`, `updateRosterFaction` server actions
4. **Season detail page roster** — Roster display + join/leave UI
5. **Admin roster actions** — `addParticipant`, `removeParticipant`, `updateParticipantFaction`
6. **Admin roster manager** — Roster management UI on season edit page
7. **Season list page** — Show participant counts on season cards
8. **Build and lint** — Verify no errors

## Key Design Decisions

1. **`season_roster` not `season_participants`** — Named "roster" to reflect that it includes the army choice, not just participation. A roster is a list of players and what they're bringing.

2. **Faction per season, not per profile** — Players select their army when joining a season, separate from their profile factions. A player might list Space Marines and Orks on their profile but choose to play Orks for a specific season.

3. **Member self-signup + admin management** — Members can join/leave on their own, reducing admin burden. Admins and organizers retain full control to add/remove anyone (including unlinked profiles who can't sign themselves up).

4. **Single faction per roster entry** — Each player brings one army to a season. This keeps the data model simple. If a player wants to switch armies mid-season, they update their roster entry.

5. **Published seasons only for self-signup** — Members can only join published seasons. Admins/organizers can manage rosters for any season (including drafts) to set things up before publishing.

6. **Supersedes season-participants.md** — This doc replaces the earlier admin-only plan. The `season_participants` table name and approach are replaced by `season_roster` with broader access.

## Notes

- **Depends on:** Organizer auth role (in progress on `refactor/organizer-role`) for organizer RLS policies. If implemented before that lands, use admin-only policies and update when the organizer role merges.
- **Supersedes:** `docs/seasons/season-participants.md` — that doc should be marked as superseded.
- The existing `FactionSelector` component can be referenced for the hierarchical faction dropdown pattern, but a simpler single-select variant is needed for roster signup.
- Future enhancement: bulk-add all current members to a season roster.
- Future enhancement: filter battle report player selection to only season roster members.
