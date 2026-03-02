# Season WYSIWYG Editor for Rules and Description

**Epic:** Other
**Type:** Enhancement
**Status:** Completed

## Summary

Add a simple, reusable WYSIWYG editor component for editing season rules and description fields. The editor supports bold, italic, numbered lists, and bullet points. Content is stored as markdown in the database and rendered with a reusable markdown renderer component.

## Motivation

Season descriptions and rules currently lack rich text formatting, limiting organizers' ability to clearly communicate league structure, rules, and details to members. A lightweight WYSIWYG editor lets admins write formatted content without needing to know markdown syntax, while storing markdown in the database keeps the data portable and simple.

## Acceptance Criteria

- [x] A reusable `MarkdownEditor` component exists with toolbar buttons for bold, italic, bullet list, and numbered list
- [x] A reusable `MarkdownRenderer` component renders markdown content with styled typography (bold, italic, lists)
- [x] The season form uses `MarkdownEditor` for the rules field
- [x] The season detail page renders rules using `MarkdownRenderer`
- [x] Markdown is stored as plain text in the database (no HTML conversion)
- [x] Build and lint pass

## Approach

### Step 1: Create MarkdownEditor component

A reusable textarea with a formatting toolbar (bold, italic, bullet list, numbered list). Uses React refs to manage cursor position and text insertion. Supports wrapping selected text in markdown syntax and auto-prefixing list items.

### Step 2: Create MarkdownRenderer component

A wrapper around `react-markdown` that maps markdown elements to styled HTML with Tailwind classes (bold, italic, lists with proper indentation and spacing).

### Step 3: Integrate into season form

Replace the plain textarea for the rules field with the MarkdownEditor component. The description field remains a plain textarea.

### Step 4: Render markdown on season detail page

Use MarkdownRenderer to display the rules section on the public season detail page.

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `src/modules/markdown/components/markdown-editor.tsx` | Reusable markdown editor with formatting toolbar |
| Create | `src/modules/markdown/components/markdown-renderer.tsx` | Renders markdown to styled HTML via react-markdown |
| Modify | `src/app/admin/seasons/season-form.tsx` | Uses MarkdownEditor for the rules field |
| Modify | `src/app/seasons/[id]/page.tsx` | Uses MarkdownRenderer to display rules |

## Key Decisions

1. **Store markdown in the database** — Markdown is lightweight, human-readable, and easily rendered on the frontend. Alternatives like storing HTML or using a structured document format add complexity without clear benefit for this use case.

2. **`react-markdown` for rendering** — Provides safe, dependency-light markdown rendering with customizable component mappings for Tailwind styling. No need for a heavier library like MDX or a full WYSIWYG framework.

3. **Toolbar-based editor over rich text** — A toolbar that inserts markdown syntax into a plain textarea is simpler and more reliable than a contentEditable-based rich text editor. It avoids complex state management and cursor handling that full WYSIWYG editors require.
