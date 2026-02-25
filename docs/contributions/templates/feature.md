# [Feature Name]

**Epic:** [Epic name — e.g., Member Profiles, Battle Reports, Factions]
**Type:** Feature
**Status:** Todo

<!--
Status values:
  Todo        — Not started, no acceptance criteria completed
  In Progress — Partially implemented, some acceptance criteria completed
  Completed   — Fully implemented, all acceptance criteria completed
-->

## Summary

[1-3 sentences describing what this feature does, who it's for, and what value it provides.]

## Acceptance Criteria

- [ ] [Criterion describing a specific, verifiable outcome]
- [ ] [Criterion describing a specific, verifiable outcome]
- [ ] [Criterion describing a specific, verifiable outcome]

<!--
Guidelines:
  - Each criterion should be independently verifiable (can be checked off on its own)
  - Write from the user's perspective: "Users can...", "Admins can...", "The page displays..."
  - Include security/access control criteria: "Non-admin users cannot..."
  - Include edge cases and validation: "Validation prevents..."
  - Include data persistence: "Changes are saved to the database and reflected immediately"
-->

## Routes

<!--
List any new or modified routes. Remove this section if no route changes are needed.
-->

| Route | Description |
|---|---|
| `/path` | [What this route does] |

## Database

<!--
Describe any schema changes: new tables, columns, RLS policies, triggers, or seed data.
Remove this section if no database changes are needed.
-->

### Migration: `supabase/migrations/XXXXXX_[description].sql`

[Describe what the migration creates or modifies.]

### RLS Policies

- **SELECT:** [Who can read and under what conditions]
- **INSERT:** [Who can create and under what conditions]
- **UPDATE:** [Who can modify and under what conditions]
- **DELETE:** [Who can remove and under what conditions]

## Implementation

<!--
Describe the technical approach. Break into numbered steps or subsections.
Reference existing patterns in the codebase where applicable.
-->

### Key Files

<!--
List all files created or modified by this feature.
-->

| Action | File | Description |
|---|---|---|
| Create | `src/app/...` | [What this file does] |
| Modify | `src/app/...` | [What changed and why] |

### Approach

#### 1. [First implementation step]

[Detailed description of the approach, including code patterns to follow.]

#### 2. [Second implementation step]

[Detailed description.]

## Key Design Decisions

<!--
Document the "why" behind important choices. Each decision should explain
what was chosen, what alternatives existed, and why this approach was picked.
Number each decision for easy reference.
-->

1. **[Decision title]** — [Explanation of what was decided and why.]
2. **[Decision title]** — [Explanation of what was decided and why.]

## Notes

<!--
Optional. Include anything that doesn't fit above:
  - Prerequisites or dependencies on other features
  - Known limitations or future enhancements
  - Setup steps (e.g., manual database seeding, environment variables)
  - Links to related features or external documentation
Remove this section if not needed.
-->
