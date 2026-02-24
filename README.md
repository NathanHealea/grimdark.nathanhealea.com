<h1 align="center">Grimdark League</h1>

<p align="center">
  <strong>A Warhammer 40k league management platform</strong><br/>
  Track battles. Showcase your army. Climb the leaderboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/DaisyUI-5-FF9903?logo=daisyui&logoColor=white" alt="DaisyUI 5" />
</p>

---

## About

Grimdark League is a web app for Warhammer 40k tabletop gaming communities. It provides league organizers and players with tools to manage member profiles, record battle results, and track standings across seasons.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4, DaisyUI v5 (custom grimdark theme) |
| **UI Components** | Headless UI v2, Heroicons v2 |
| **Backend / Database** | Supabase (PostgreSQL, Auth, Row Level Security, SSR) |
| **Tooling** | ESLint 9, Prettier 3, Supabase CLI |

## Features

| Feature | Status |
|---|---|
| Email/password authentication (Supabase Auth) | Done |
| Social media login (Discord) | Done |
| Profile creation on first login | Done |
| Protected routes with middleware | Done |
| Role-based access control (user, member, admin) | Done |
| Admin user management | Done |
| Member profile pages with faction display | Done |
| Edit own profile (display name, bio, factions) | Done |
| Profile picture (avatar from OAuth provider) | Done |
| Change profile picture (upload) | Done |
| Member directory | Done |
| Faction data model with hierarchical sub-factions | Done |
| Faction selector (select + add/remove UX) | Done |
| Select factions for profile | Done |
| Battle report submission | Done |
| Battle report feed & detail views | Done |
| Battle report draft/published status | Done |
| Season selection on battle reports | Done |
| Non-admins cannot unpublish reports | Done |
| Admin battle reports management | Done |
| Member directory with battle & season stats | Done |
| Responsive navbar (mobile) | Done |
| Season management (admin CRUD) | Done |
| Admin profile editing | In Progress |
| Browse factions page | Planned |
| League landing page | Planned |
| Leaderboard & standings | Planned |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) (for local Supabase)

### Installation

```bash
# Clone the repository
git clone https://github.com/NathanHealea/grimdark.nathanhealea.com.git
cd grimdark.nathanhealea.com

# Install dependencies
npm install

# Start local Supabase
npm run db:start

# Start the dev server
npm run dev
```

## Database

### Applying migrations from git

After pulling new code that includes migration files in `supabase/migrations/`, apply them to your local database:

```bash
npx supabase db reset
```

This drops and recreates your local database, running all migrations in order. Use this when you pull changes that add or modify migration files.

### Pulling schema changes from the remote database

If schema changes were made directly on the remote Supabase project (e.g. via the Dashboard or SQL Editor), pull them into a local migration file:

```bash
# Link to the remote project (one-time setup)
npx supabase link

# Pull remote schema changes into a new migration file
npx supabase db pull
```

This generates a new migration file in `supabase/migrations/` capturing any differences between your local migrations and the remote schema. Review the generated file, then commit it to git.

### Regenerating TypeScript types

After any schema change, regenerate the TypeScript types:

```bash
npm run db:types
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prettify` | Format codebase with Prettier |
| `npm run db:start` | Start local Supabase (Docker) |
| `npm run db:types` | Generate TypeScript types from Supabase schema |

## Project Structure

```
src/
  app/                  # Next.js App Router pages & layouts
    (auth)/             # Sign in / sign up routes
    profile/            # Profile setup, edit, and view routes
  components/           # Shared UI components (navbar, user menu)
  lib/supabase/         # Supabase client, auth helpers, role utilities
  modules/              # Feature modules
    battle-report/      # Battle report queries, validation, and components
    faction/            # Faction queries, utilities, and components
    profile/            # Profile validation
    season/             # Season queries
  types/                # TypeScript type definitions
docs/
  overview.md           # Project overview & epic tracking
  features/             # Feature specifications & acceptance criteria
  bugs/                 # Bug reports
  contributions/        # Contributing guides
supabase/
  migrations/           # Database migrations & seed data
```

## Contributing

- [Installation & Configuration](./docs/contributions/installation-and-configuration.md)
- [GitHub Issue Guidelines](./docs/contributions/issues.md)
- [Project Overview & Epics](./docs/overview.md)

## License

Private project. All rights reserved.
