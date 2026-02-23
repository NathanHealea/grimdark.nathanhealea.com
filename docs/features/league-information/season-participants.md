# Season Participants

**Epic:** League Information
**Status:** Todo

## Summary

Allow administrators to add profiles to a season as active participants. A season participant is a player who is eligible to play and have their results counted for that season's standings. This creates the foundation for season-scoped player selection in battle reports and season-scoped leaderboards.

## Acceptance Criteria

### Admin Management

- [ ] Admins can view the list of participants for any season
- [ ] Admins can add any profile (linked or unlinked) as a participant to a season
- [ ] Admins can remove a participant from a season
- [ ] Adding a participant that is already in the season is a no-op (no error)
- [ ] The participant list shows display name, avatar, and linked/unlinked status
- [ ] Non-admin users cannot modify season participants (server-side role check)

### Season Page Integration

- [ ] The public season detail page (`/seasons/[id]`) shows the list of participants
- [ ] Participants are displayed with display name and avatar
- [ ] Participant count is shown on the season card on the seasons list page

### Data Model

- [ ] A `season_participants` join table links profiles to seasons
- [ ] A profile can participate in multiple seasons
- [ ] A season can have multiple participants
- [ ] Deleting a profile cascades and removes their participation records
- [ ] Deleting a season cascades and removes all participation records for that season

## Routes

| Route | Description |
|---|---|
| `/admin/seasons` | Modified — season edit form includes participant management |
| `/seasons/[id]` | Modified — shows participant list |

## Database

### Migration: `supabase/migrations/XXXXXX_create_season_participants.sql`

```sql
-- Season participants join table
CREATE TABLE public.season_participants (
  season_id integer NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (season_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.season_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can read season participants (public data for standings/display)
CREATE POLICY "Season participants are publicly readable"
  ON public.season_participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can manage participants
CREATE POLICY "Admins can insert season participants"
  ON public.season_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can delete season participants"
  ON public.season_participants
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

### RLS Policies

- **SELECT:** Public — anyone can see who participates in a season
- **INSERT:** Admins only
- **UPDATE:** Not needed (no updatable columns beyond the composite PK)
- **DELETE:** Admins only

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_create_season_participants.sql` | New table, RLS policies |
| Create | `src/modules/season/components/participant-manager.tsx` | Client component for adding/removing participants |
| Create | `src/app/admin/seasons/participant-actions.ts` | `addParticipant` and `removeParticipant` server actions |
| Modify | `src/app/admin/seasons/page.tsx` | Fetch and pass participants to season edit form |
| Modify | `src/app/admin/seasons/season-form.tsx` | Include participant manager section |
| Modify | `src/app/seasons/[id]/page.tsx` | Display participant list |
| Modify | `src/modules/season/queries.ts` | Add `getSeasonParticipants()` and `getSeasonParticipantCounts()` |
| Modify | `src/modules/battle-report/queries.ts` | Add `getSeasonParticipants()` for battle report form filtering |
| Modify | `src/types/season.ts` | Add `SeasonParticipant` type |

### Approach

#### 1. Database Migration

Create the `season_participants` table as described above. The composite primary key `(season_id, profile_id)` prevents duplicate entries and enables `ON CONFLICT DO NOTHING` for idempotent inserts.

#### 2. Types and Queries

Add to `src/types/season.ts`:

```ts
export type SeasonParticipant = {
  season_id: number
  profile_id: string
  joined_at: string
}
```

Add queries to `src/modules/season/queries.ts`:

```ts
// Get participants for a specific season (with profile data)
export async function getSeasonParticipantsWithProfiles(seasonId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('season_participants')
    .select('season_id, profile_id, joined_at, profiles(id, display_name, avatar_url, profile_id)')
    .eq('season_id', seasonId)
    .order('joined_at')
  return data ?? []
}

// Get all season-profile associations (for battle report form filtering)
export async function getAllSeasonParticipants() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('season_participants')
    .select('season_id, profile_id')
  return data ?? []
}

// Get participant counts per season (for season list page)
export async function getSeasonParticipantCounts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('season_participants')
    .select('season_id')
  const counts = new Map<number, number>()
  for (const row of data ?? []) {
    counts.set(row.season_id, (counts.get(row.season_id) ?? 0) + 1)
  }
  return counts
}
```

#### 3. Participant Manager Component

A client component used in the admin season edit form:

- Displays current participants as a list with avatars and remove buttons
- Includes a select dropdown of all member/organizer profiles not yet in the season
- "Add" button calls `addParticipant` server action
- Remove button calls `removeParticipant` server action
- Uses `useActionState` for each action with success/error feedback

#### 4. Server Actions

```ts
// src/app/admin/seasons/participant-actions.ts

export async function addParticipant(prevState, formData) {
  // Verify admin, extract season_id and profile_id
  // Insert into season_participants (ON CONFLICT DO NOTHING)
  // Revalidate path
}

export async function removeParticipant(prevState, formData) {
  // Verify admin, extract season_id and profile_id
  // Delete from season_participants
  // Revalidate path
}
```

#### 5. Public Season Page

On `/seasons/[id]`, fetch participants with profiles and display as a grid of avatar + name cards below the season details. Show participant count.

#### 6. Season List Page

On `/seasons`, fetch participant counts per season and display alongside battle report counts on each season card.

## Key Design Decisions

1. **Separate join table over column on profiles** — A join table supports many-to-many (players in multiple seasons) and keeps the profiles table clean. It also enables easy querying of "who is in this season" and "what seasons has this player been in."

2. **Publicly readable** — Season participants are public information, consistent with how member profiles and battle reports are publicly visible. Anyone browsing the site can see who is playing in a season.

3. **Admin-only management** — Only admins can add or remove participants. Players cannot self-register for seasons. This matches the league's small-group, organizer-driven model.

4. **Cascade deletes** — Deleting a season removes all its participant records. Deleting a profile removes all their participation records. This prevents orphaned data.

5. **Idempotent inserts** — Using `ON CONFLICT DO NOTHING` on the composite PK means adding an existing participant is safe to call repeatedly without errors.

## Notes

- **Prerequisite for:** Battle Report Player Selection Refactor (which filters players by season participants)
- **Prerequisite for:** Standings and Leaderboard (which calculates rankings scoped to a season's participants)
- When the Profile Merge feature transfers data, it should also transfer `season_participants` records from source to target.
- Consider a future "bulk add" feature where admins can add all current members to a season at once.
