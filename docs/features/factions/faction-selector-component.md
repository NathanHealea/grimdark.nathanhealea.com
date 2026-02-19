# Faction Selector Component

**Epic:** Factions
**Status:** Completed

## Summary

A reusable client component for selecting one or more factions from the available list. Used across multiple forms including profile setup, profile editing, and battle report submission.

## Acceptance Criteria

- [x] Component receives the factions list via props and renders selectable options
- [x] Supports multi-select for profile forms (select multiple factions)
- [ ] Can be configured for single-select in contexts that require it (e.g., battle report faction per player)
- [x] Returns selected faction IDs to the parent form via hidden inputs
- [x] Works as a client component (`'use client'`) for interactive selection
- [x] Reusable across profile setup and profile edit forms

## Implementation

### Key File: `src/modules/faction/components/faction-selector.tsx`

- `'use client'` component accepting `factions`, `selectedIds`, `name`, and `error` props
- Renders a `<select>` dropdown grouped by root faction (Imperium/Chaos/Xenos via `<optgroup>`) with sub-factions as options and chapters indented
- Already-selected factions are filtered out of the dropdown
- "Add" button appends the selected faction to a visible list
- Each selected faction displays its full ancestry path (e.g. "Imperium > Space Marines > Blood Angels") with a "Remove" button
- Hidden `<input>` elements carry selected IDs for form submission via `formData.getAll('faction_ids')`

### Supporting Files

- `src/modules/faction/queries.ts` — `getFactions()` and `getProfileFactionIds()` queries
- `src/modules/faction/utils.ts` — `buildFactionTree()` utility for nested tree rendering
- `src/types/faction.ts` — `Faction` and `FactionNode` types
