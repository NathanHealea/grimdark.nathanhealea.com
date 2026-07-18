# Project Overview

**Grimdark League** is a league management tool for a small, local Warhammer 40,000 tabletop gaming group (5-15 players) based in Eugene/Springfield, Oregon. Run by a small team of 2-3 organizers, the app focuses on league operations and competitive tracking — not social features.

## What It Does

The app serves three user types:

- **Members (players)** join the league, maintain a profile with their factions, record battle results, and track standings.
- **Organizers (admins)** manage member roles, edit profiles, and oversee league operations through an admin panel.
- **Visitors** can browse public pages (member directory, battle reports, standings) without logging in.

The core loop: **members join, play games, record results, and track standings.**

## Domain

- **Factions** — Armies organized hierarchically: alliance (Imperium, Chaos, Xenos) > faction (Space Marines, Aeldari) > sub-faction/chapter (Blood Angels, Dark Angels). Players associate multiple factions with their profile.
- **Battle Reports** — Game records capturing attacker/defender, factions, scores, outcome (win/loss/draw), mission, deployment, battle size, and rounds.
- **Battle Sizes** — Standard point levels: Combat Patrol (500), Incursion (1000), Strike Force (2000), Onslaught (3000).
- **Missions & Deployments** — Predefined game scenarios and map configurations from the official rules.
- **Seasons** — Time-bounded league periods with battle size and date ranges. Members can assign battle reports to active seasons; admins can assign to any season. Admins manage seasons through the admin panel.
- **Standings** — Win/loss/draw records and rankings derived from battle reports, filtered by season.

## Product Direction

Current priority: finish the MVP epics listed below. After MVP:

- **Stats & analytics** — Player win rates, faction matchup data, historical trends across seasons.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4, DaisyUI v5 |
| **UI Components** | Headless UI v2, Heroicons v2 |
| **Backend / Database** | Supabase (PostgreSQL, Auth, RLS, SSR) |
| **Tooling** | ESLint 9, Prettier 3, Supabase CLI |

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

### Epic 01: Authentication & User Accounts

**Goal:** Allow league members to register, log in, and manage their account.

**High-Level Scope:**

- [x] [Sign up / sign in via Supabase Auth (email/password)](./01-authentication-and-user-accounts/01-sign-up-sign-in.md)
- [x] [User profile creation on first login](./01-authentication-and-user-accounts/02-user-profile-creation-on-first-login.md)
- [x] [Protected routes for authenticated features](./01-authentication-and-user-accounts/03-protected-routes.md)
- [x] [User roles (user, member, admin)](./01-authentication-and-user-accounts/04-user-roles.md)
- [x] [Social media login (Google, Discord)](./01-authentication-and-user-accounts/05-social-media-login.md)

### Epic 02: League Information

**Goal:** Provide a public-facing hub with league details so newcomers and members can find what they need.

**High-Level Scope:**

- [ ] [League landing page with description, rules, and schedule](./02-league-information/01-landing-page.md)
- [ ] [Public visibility — no login required to view](./02-league-information/02-public-visibility.md)

### Epic 03: Seasons

**Goal:** Organize league play into time-bounded seasons with defined formats, rules, and standings.

**High-Level Scope:**

- [x] [Season information (start/end dates, format, point limits)](./03-seasons/01-season-information.md)
- [x] [Season roster (member signup + admin management)](./03-seasons/02-season-roster.md)
- [x] [Draft/published mode for seasons](./03-seasons/03-season-draft-published-mode.md)
- [x] [Admin season delete](./03-seasons/04-admin-season-delete.md)
- [ ] [Season editions association (multi-edition support)](./03-seasons/05-season-editions.md)

### Epic 04: Editions

**Goal:** Maintain a managed catalog of Warhammer rules editions (10th, 11th, future editions) with their own per-edition missions and deployments, so seasons and battle reports stay consistent with the rules in play.

**High-Level Scope:**

- [ ] [Editions data model and seed](./04-editions/01-editions-data-model.md)
- [x] [Admin edition management](./04-editions/02-admin-edition-management.md)
- [x] [Edition missions management](./04-editions/03-edition-missions-management.md)
- [x] [Edition deployments management](./04-editions/04-edition-deployments-management.md)

### Epic 05: Member Profiles

**Goal:** Let members showcase their army and track their league participation.

**High-Level Scope:**

- [x] [Member profile page (display name, faction/army, bio)](./05-member-profiles/01-member-profile-page.md)
- [x] [Member directory listing all active league participants (with battle and season counts)](./05-member-profiles/02-member-directory.md)
- [x] [Members can edit their own profile](./05-member-profiles/03-edit-own-profile.md)
- [x] [Admins can edit any member's profile](./05-member-profiles/04-admin-edit-profile.md)
- [x] [Profile picture display (avatar from OAuth provider)](./05-member-profiles/05-profile-picture.md)
- [x] [Profile picture upload](./05-member-profiles/06-change-profile-picture.md)
- [x] [Unlinked profiles (admin pre-registration)](./05-member-profiles/07-unlinked-profiles.md)
- [x] [Admin profile linking & merge](./05-member-profiles/08-admin-profile-linking.md)

### Epic 06: Factions

**Goal:** Provide a managed list of Warhammer 40k factions that users can associate with their profiles and reference in forms like battle reports.

**High-Level Scope:**

- [x] [Factions data model and seed data](./06-factions/01-factions-data-model.md)
- [ ] [Browse factions page](./06-factions/02-browse-factions.md)
- [x] [Select factions for profile](./06-factions/03-select-factions-for-profile.md)
- [ ] [Reusable faction selector component](./06-factions/04-faction-selector-component.md)

### Epic 07: Battle Reports

**Goal:** Record and display game results between league members.

**High-Level Scope:**

- [x] [Submit a battle report (players, factions, points, outcome, mission)](./07-battle-reports/01-submit-battle-report.md)
- [x] [Battle report detail view with game summary](./07-battle-reports/02-battle-report-detail-view.md)
- [x] [Battle report feed/history viewable by all members](./07-battle-reports/03-battle-report-feed.md)
- [x] [Draft/published status with save draft and edit support](./07-battle-reports/04-battle-report-draft-status.md)
- [x] Season selection on battle report submit and edit (members: active seasons; admins: all seasons)
- [x] Non-admins cannot unpublish a published battle report
- [x] Admin battle reports management page
- [x] [Admin battle report delete](./07-battle-reports/05-battle-report-delete.md)
- [ ] [Battle report edition + filtered mission/deployment](./07-battle-reports/06-battle-report-edition.md)

### Epic 08: 11th Edition Battle Reports

**Goal:** Record 11th edition games — Force Dispositions, matrix-derived primary missions, and secondary mission tracking — alongside unchanged 10th edition reporting, with the report's required edition field driving which form the user fills out.

**High-Level Scope:**

- [x] [Force dispositions data model (table, mission matchup mapping, seed)](./08-11th-edition-battle-reports/01-force-dispositions-data-model.md)
- [x] [11th edition data seed (6 deployments, 25 mapped primary missions)](./08-11th-edition-battle-reports/02-11th-edition-data-seed.md)
- [x] [Battle report force dispositions (schema, form, validation, actions)](./08-11th-edition-battle-reports/03-battle-report-force-dispositions.md)
- [x] [Battle report 11th edition display (detail, feed, admin table)](./08-11th-edition-battle-reports/04-battle-report-11th-display.md)
- [x] [Admin force dispositions management](./08-11th-edition-battle-reports/05-admin-force-dispositions.md)

### Epic 09: Standings & Leaderboard

**Goal:** Automatically track league rankings based on battle report results.

**High-Level Scope:**

- [x] [Leaderboard page with win/loss/draw records](./09-standings-and-leaderboard/01-leaderboard-page.md)
- [x] [Rankings calculated from submitted battle reports](./09-standings-and-leaderboard/02-rankings-from-battle-reports.md)
- [x] [Filter by current season](./09-standings-and-leaderboard/03-filter-by-season.md)
- [x] [Leaderboard ranking improvement](./09-standings-and-leaderboard/04-leaderboard-ranking-improvement.md)
- [ ] [Leaderboard position tracking](./09-standings-and-leaderboard/05-leaderboard-position-tracking.md)

### Epic 10: UI Refactor

**Goal:** Migrate the UI layer from DaisyUI to shadcn/ui with no change to behavior, routing, or data — preserving the current dark grimdark look (admin section excepted, redesigned as a dashboard).

**High-Level Scope:**

- [x] [shadcn setup & theme foundation](./10-ui-refactor/01-shadcn-setup-and-theme-foundation.md)
- [x] [Shared UI primitives](./10-ui-refactor/02-shared-primitives.md)
- [x] [Shared app components](./10-ui-refactor/03-shared-app-components.md)
- [ ] [Auth & profile domain](./10-ui-refactor/04-auth-and-profile.md)
- [ ] [Battle reports & factions domain](./10-ui-refactor/05-battle-reports-and-factions.md)
- [ ] [Home, leaderboard, seasons & guides](./10-ui-refactor/06-home-leaderboard-seasons-guides.md)
- [ ] [Admin dashboard redesign](./10-ui-refactor/07-admin-dashboard-redesign.md)
