# Member Directory

**Epic:** Member Profiles
**Type:** Feature
**Status:** Completed

## Summary

A listing page showing all active league participants so members can browse who's in the league.

## Acceptance Criteria

- [x] Directory lists all active league members
- [x] Each entry shows display name and faction/army
- [x] Entries link to the member's full profile page

## Implementation Details

- **Route:** `/members` (public, no authentication required)
- **Page:** `src/app/members/page.tsx` — async server component
- **Data:** Fetches profiles, factions, and profile_factions in parallel; groups factions by profile
- **UI:** Responsive grid of cards with avatar, display name, and faction badges
- **Navigation:** "Members" link added to navbar, visible to all users
- **RLS:** `anon` SELECT policies added for profiles, factions, and profile_factions tables
