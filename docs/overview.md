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

### Epic: Authentication & User Accounts

**Goal:** Allow league members to register, log in, and manage their account.

**High-Level Scope:**

- [x] [Sign up / sign in via Supabase Auth (email/password)](./authentication-and-user-accounts/sign-up-sign-in.md)
- [x] [User profile creation on first login](./authentication-and-user-accounts/user-profile-creation-on-first-login.md)
- [x] [Protected routes for authenticated features](./authentication-and-user-accounts/protected-routes.md)
- [x] [User roles (user, member, admin)](./authentication-and-user-accounts/user-roles.md)
- [x] [Social media login (Google, Discord)](./authentication-and-user-accounts/social-media-login.md)

### Epic: League Information

**Goal:** Provide a public-facing hub with league details so newcomers and members can find what they need.

**High-Level Scope:**

- [ ] [League landing page with description, rules, and schedule](./league-information/landing-page.md)
- [ ] [Public visibility — no login required to view](./league-information/public-visibility.md)

### Epic: Seasons

**Goal:** Organize league play into time-bounded seasons with defined formats, rules, and standings.

**High-Level Scope:**

- [x] [Season information (start/end dates, format, point limits)](./seasons/season-information.md)
- [ ] [Season participants (admin-managed player rosters per season)](./seasons/season-participants.md)
- [ ] [Draft/published mode for seasons](./seasons/season-draft-published-mode.md)
- [x] [Admin season delete](./seasons/admin-season-delete.md)

### Epic: Member Profiles

**Goal:** Let members showcase their army and track their league participation.

**High-Level Scope:**

- [x] [Member profile page (display name, faction/army, bio)](./member-profiles/member-profile-page.md)
- [x] [Member directory listing all active league participants (with battle and season counts)](./member-profiles/member-directory.md)
- [x] [Members can edit their own profile](./member-profiles/edit-own-profile.md)
- [x] [Admins can edit any member's profile](./member-profiles/admin-edit-profile.md)
- [x] [Profile picture display (avatar from OAuth provider)](./member-profiles/profile-picture.md)
- [x] [Profile picture upload](./member-profiles/change-profile-picture.md)
- [x] [Unlinked profiles (admin pre-registration)](./member-profiles/unlinked-profiles.md)
- [x] [Admin profile linking & merge](./member-profiles/admin-profile-linking.md)

### Epic: Factions

**Goal:** Provide a managed list of Warhammer 40k factions that users can associate with their profiles and reference in forms like battle reports.

**High-Level Scope:**

- [x] [Factions data model and seed data](./factions/factions-data-model.md)
- [ ] [Browse factions page](./factions/browse-factions.md)
- [x] [Select factions for profile](./factions/select-factions-for-profile.md)
- [x] [Reusable faction selector component](./factions/faction-selector-component.md)

### Epic: Battle Reports

**Goal:** Record and display game results between league members.

**High-Level Scope:**

- [x] [Submit a battle report (players, factions, points, outcome, mission)](./battle-reports/submit-battle-report.md)
- [x] [Battle report detail view with game summary](./battle-reports/battle-report-detail-view.md)
- [x] [Battle report feed/history viewable by all members](./battle-reports/battle-report-feed.md)
- [x] [Draft/published status with save draft and edit support](./battle-reports/battle-report-draft-status.md)
- [x] Season selection on battle report submit and edit (members: active seasons; admins: all seasons)
- [x] Non-admins cannot unpublish a published battle report
- [x] Admin battle reports management page
- [x] [Admin battle report delete](./battle-reports/battle-report-delete.md)

### Epic: Standings & Leaderboard

**Goal:** Automatically track league rankings based on battle report results.

**High-Level Scope:**

- [x] [Leaderboard page with win/loss/draw records](./standings-and-leaderboard/leaderboard-page.md)
- [x] [Rankings calculated from submitted battle reports](./standings-and-leaderboard/rankings-from-battle-reports.md)
- [x] [Filter by current season](./standings-and-leaderboard/filter-by-season.md)
- [ ] [Leaderboard ranking improvement](./standings-and-leaderboard/leaderboard-ranking-improvement.md)
- [ ] [Leaderboard position tracking](./standings-and-leaderboard/leaderboard-position-tracking.md)
