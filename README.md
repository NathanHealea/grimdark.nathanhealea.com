# Grimdark League

A Warhammer 40k league website for displaying league information, managing league member profiles, and recording battle reports.

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4, DaisyUI v5
- **Backend/Database**: Supabase (PostgreSQL, Auth)
- **Icons**: Heroicons v2

## Features

- **Authentication** — Email/password sign-up and sign-in via Supabase Auth
- **User Profiles** — Profile creation on first login with display name
- **League Information** — Landing page with league details _(planned)_
- **Member Profiles** — Member directory and profile pages _(planned)_
- **Battle Reports** — Submit and view game results _(planned)_
- **Standings & Leaderboard** — Rankings from battle reports _(planned)_

## Scripts

| Command            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Start dev server                               |
| `npm run build`    | Production build                               |
| `npm run start`    | Production server                              |
| `npm run lint`     | Run ESLint                                     |
| `npm run prettify` | Format codebase with Prettier                  |
| `npm run db:start` | Start local Supabase (Docker)                  |
| `npm run db:types` | Generate TypeScript types from Supabase schema |

## Contributing

- [Installation & Configuration](./docs/contributions/installation-and-configuration.md)
- [GitHub Issue Guidelines](./docs/contributions/issues.md)
- [Project Overview & Epics](./docs/overview.md)
