# Project Overview

A Warhammer 40k league website for displaying league information, managing league member profiles, and recording battle reports.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, DaisyUI v5
- **UI Components**: Headless UI v2, Heroicons v2
- **Backend/Database**: Supabase (PostgreSQL, Auth, RLS, SSR)
- **Tooling**: ESLint 9, Prettier 3, Supabase CLI

---

## Status Key

| Status | Description |
|---|---|
| **Todo** | Not started — no acceptance criteria completed |
| **In Progress** | Partially implemented — some acceptance criteria completed |
| **Completed** | Fully implemented — all acceptance criteria completed |

## MVP Features (Epics)

<!--
Epic Template:

### Epic: [Name]
**Goal:** [What this epic delivers to the user]

**High-Level Scope:**
- [Capability or user story]
- [Capability or user story]
- [Capability or user story]
-->

### Epic: Authentication & User Accounts

**Goal:** Allow league members to register, log in, and manage their account.

**High-Level Scope:**

- [x] [Sign up / sign in via Supabase Auth (email/password)](./features/authentication-and-user-accounts/sign-up-sign-in.md)
- [x] [User profile creation on first login](./features/authentication-and-user-accounts/user-profile-creation-on-first-login.md)
- [x] [Protected routes for authenticated features](./features/authentication-and-user-accounts/protected-routes.md)
- [ ] [User roles (user, member, admin)](./features/authentication-and-user-accounts/user-roles.md)
- [ ] [Social media login (Google, Discord)](./features/authentication-and-user-accounts/social-media-login.md)

### Epic: League Information

**Goal:** Provide a public-facing hub with league details so newcomers and members can find what they need.

**High-Level Scope:**

- [ ] [League landing page with description, rules, and schedule](./features/league-information/landing-page.md)
- [ ] [Season information (start/end dates, format, point limits)](./features/league-information/season-information.md)
- [ ] [Public visibility — no login required to view](./features/league-information/public-visibility.md)

### Epic: Member Profiles

**Goal:** Let members showcase their army and track their league participation.

**High-Level Scope:**

- [x] [Member profile page (display name, faction/army, bio)](./features/member-profiles/member-profile-page.md)
- [ ] [Member directory listing all active league participants](./features/member-profiles/member-directory.md)
- [x] [Members can edit their own profile](./features/member-profiles/edit-own-profile.md)
- [ ] [Admins can edit any member's profile](./features/member-profiles/admin-edit-profile.md)

### Epic: Factions

**Goal:** Provide a managed list of Warhammer 40k factions that users can associate with their profiles and reference in forms like battle reports.

**High-Level Scope:**

- [x] [Factions data model and seed data](./features/factions/factions-data-model.md)
- [ ] [Browse factions page](./features/factions/browse-factions.md)
- [ ] [Select factions for profile](./features/factions/select-factions-for-profile.md)
- [ ] [Reusable faction selector component](./features/factions/faction-selector-component.md)

### Epic: Battle Reports

**Goal:** Record and display game results between league members.

**High-Level Scope:**

- [ ] [Submit a battle report (players, factions, points, outcome, mission)](./features/battle-reports/submit-battle-report.md)
- [ ] [Battle report detail view with game summary](./features/battle-reports/battle-report-detail-view.md)
- [ ] [Battle report feed/history viewable by all members](./features/battle-reports/battle-report-feed.md)

### Epic: Standings & Leaderboard

**Goal:** Automatically track league rankings based on battle report results.

**High-Level Scope:**

- [ ] [Leaderboard page with win/loss/draw records](./features/standings-and-leaderboard/leaderboard-page.md)
- [ ] [Rankings calculated from submitted battle reports](./features/standings-and-leaderboard/rankings-from-battle-reports.md)
- [ ] [Filter by current season](./features/standings-and-leaderboard/filter-by-season.md)
