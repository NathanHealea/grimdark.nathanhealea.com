# Select Factions for Profile

**Epic:** Factions

## Summary

Allow users to associate one or more Warhammer 40k factions with their profile. Factions can be selected during the profile setup flow and updated when editing a profile. Selected factions are displayed on the member profile page and in the member directory.

## Acceptance Criteria

- [x] Profile setup flow includes an optional faction selection step
- [x] Users can select multiple factions from the full list
- [x] Selections are stored in the `profile_factions` join table
- [x] Users can update their faction selections when editing their profile
- [x] Selected factions are displayed on the member's profile page
- [ ] Member directory entries show each member's selected factions
- [x] Users can only manage their own faction associations

## Implementation

### Faction Queries

- **File:** `src/modules/faction/queries.ts`
- `getFactions()` — fetches all factions ordered by name
- `getProfileFactionIds(profileId)` — fetches faction IDs for a given profile

### Faction Tree Utility

- **File:** `src/modules/faction/utils.ts`
- `buildFactionTree(factions)` — converts a flat `Faction[]` into a nested `FactionNode[]` tree (root → sub-faction → chapter)

### FactionSelector Component

- **File:** `src/modules/faction/components/faction-selector.tsx`
- `'use client'` component accepting `factions`, `selectedIds`, `name`, and `error` props
- Renders a `<select>` dropdown grouped by root faction (Imperium/Chaos/Xenos via `<optgroup>`) with sub-factions as options and chapters indented
- Already-selected factions are filtered out of the dropdown
- "Add" button adds the selected faction to a list below
- Each selected faction displays its full path (e.g. "Imperium > Space Marines > Blood Angels") with a "Remove" button
- Hidden `<input>` elements carry selected IDs for form submission via `formData.getAll('faction_ids')`

### Validation

- **File:** `src/modules/profile/validation.ts`
- `validateFactionIds(ids)` — validates each ID matches UUID format
- `ProfileFormState` includes `faction_ids` error key

### Profile Setup Flow

- **Page:** `src/app/profile/setup/page.tsx` — async server component, fetches factions via `getFactions()` and passes to form
- **Form:** `src/app/profile/setup/profile-form.tsx` — renders `<FactionSelector>` labeled as optional
- **Action:** `src/app/profile/setup/actions.ts` — after profile INSERT, reads `faction_ids` from FormData, validates, and inserts into `profile_factions` (non-blocking on failure)

### Profile Edit Flow

- **Page:** `src/app/profile/edit/page.tsx` — fetches factions and selected IDs in parallel via `Promise.all`
- **Form:** `src/app/profile/edit/edit-profile-form.tsx` — renders `<FactionSelector>` with pre-selected IDs
- **Action:** `src/app/profile/edit/actions.ts` — reads `faction_ids` from FormData, validates, then clear-and-replaces: DELETE all `profile_factions` for the user, INSERT the new set

### Display Factions on Profile Page

- **Page:** `src/app/profile/[profileId]/page.tsx`
- Fetch the profile's faction IDs via `getProfileFactionIds(profile.id)` and the full faction list via `getFactions()` in parallel using `Promise.all`
- Resolve faction IDs to `Faction` objects using a `Map` lookup
- Build display labels showing the full ancestry path (e.g. "Imperium > Space Marines > Blood Angels") using the faction map's `parent_id` chain
- Render a "Factions" section below the bio with faction names as DaisyUI badge elements
- If the user has no factions selected, show italic placeholder text: "No factions selected."

### Key Design Decisions

- **Server-fetch, pass as props** — factions are fetched in server components and passed down, no client-side data fetching
- **Hidden inputs for FormData** — selected IDs carried via hidden `<input>` elements so `formData.getAll('faction_ids')` works with the existing form pattern
- **Clear-and-replace on edit** — simpler than diffing; DELETE all + INSERT new, scoped by RLS
- **Faction selection is optional** — no minimum selection required on either form
