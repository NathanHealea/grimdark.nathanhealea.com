# GitHub Issue Guidelines

Reference document for creating consistent, well-structured GitHub issues in this repository.

---

## Issue Types

### Feature

A new capability or user-facing functionality.

### Bug

Something that is broken or not working as expected.

### Chore

Maintenance, refactoring, dependency updates, or infrastructure work with no user-facing change.

---

## Labels

Apply one **type** label and any relevant **area** labels:

**Type:**

- `feature` — New functionality
- `bug` — Something is broken
- `chore` — Maintenance / infrastructure

**Area:**

- `auth` — Authentication & user accounts
- `league` — League information & seasons
- `members` — Member profiles & directory
- `battle-reports` — Battle report submission & display
- `standings` — Leaderboard & rankings
- `ui` — Styling, layout, components
- `database` — Schema, migrations, seeds

**Priority:**

- `priority: high` — Blocking or critical path
- `priority: medium` — Important but not blocking
- `priority: low` — Nice to have

---

## Issue Templates

### Feature Issue

```
**Title:** [Short, imperative description] (e.g., "Add member profile page")

## Summary
[1-2 sentences describing what this feature does and why it matters.]

## Epic
[Which epic this belongs to, e.g., "Member Profiles"]

## Acceptance Criteria
- [ ] [Specific, testable outcome]
- [ ] [Specific, testable outcome]
- [ ] [Specific, testable outcome]

## Notes
[Optional: design considerations, technical constraints, links to related issues.]
```

### Bug Issue

```
**Title:** [What's broken] (e.g., "Battle report form loses data on validation error")

## Description
[What is happening vs. what should happen.]

## Steps to Reproduce
1. [Step]
2. [Step]
3. [Step]

## Expected Behavior
[What should happen.]

## Actual Behavior
[What happens instead.]

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 15]

## Notes
[Optional: screenshots, logs, related issues.]
```

### Chore Issue

```
**Title:** [What needs to be done] (e.g., "Update Supabase types after schema change")

## Summary
[What this chore accomplishes and why it's needed.]

## Tasks
- [ ] [Specific task]
- [ ] [Specific task]
```

---

## Writing Guidelines

- **Titles** should be short, imperative, and specific (e.g., "Add battle report submission form" not "Battle reports")
- **One concern per issue** — don't bundle unrelated work
- **Link related issues** when they exist (e.g., "Depends on #12", "Related to #5")
- **Reference the epic** from `docs/overview.md` when the issue belongs to one
- **Acceptance criteria** should be testable — someone should be able to verify each item is done
