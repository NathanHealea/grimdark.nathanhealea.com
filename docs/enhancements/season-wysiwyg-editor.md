# Season WYSIWYG Editor for Rules and Description

**Status:** In Progress
**Area:** Seasons / Components

<!--
Status values:
  Todo        — Not started, no acceptance criteria completed
  In Progress — Partially implemented, some acceptance criteria completed
  Completed   — Fully implemented, all acceptance criteria completed
-->

## Summary

Add a simple, reusable WYSIWYG editor component for editing season rules and description fields. The editor supports bold, italic, numbered lists, and bullet points. Content is stored as markdown in the database and rendered with a reusable markdown renderer component.

## Motivation

<!--
Explain why this enhancement is needed.
What problem does it solve? What user pain point does it address?
What's wrong with the current approach?
-->

Season descriptions and rules currently lack rich text formatting, limiting organizers' ability to clearly communicate league structure, rules, and details to members. A lightweight WYSIWYG editor lets admins write formatted content without needing to know markdown syntax, while storing markdown in the database keeps the data portable and simple.

## Acceptance Criteria

- [ ] [Criterion describing a specific, verifiable outcome]
- [ ] [Criterion describing a specific, verifiable outcome]
- [ ] [Criterion describing a specific, verifiable outcome]

<!--
Guidelines:
  - Each criterion should be independently verifiable (can be checked off on its own)
  - Write from the user's perspective: "Users can...", "The page displays..."
  - Include before/after comparisons where helpful
-->

## Approach

<!--
Describe the technical approach. Break into numbered steps or subsections.
Reference existing patterns in the codebase where applicable.
-->

[Description of the approach]

### Key Files

<!--
List all files created or modified by this enhancement.
-->

| Action | File | Description |
|---|---|---|
| Modify | `src/...` | [What changes and why] |

## Key Decisions

<!--
Document the "why" behind important choices. Each decision should explain
what was chosen, what alternatives existed, and why this approach was picked.
Number each decision for easy reference.
-->

1. **Store markdown in the database** — Markdown is lightweight, human-readable, and easily rendered on the frontend. Alternatives like storing HTML or using a structured document format add complexity without clear benefit for this use case.

## Notes

<!--
Optional. Include anything that doesn't fit above:
  - Prerequisites or dependencies on other features
  - Known limitations or future improvements
  - Performance considerations
  - Links to related features or external documentation
Remove this section if not needed.
-->
