# Editing the lesson content

The files in this directory use MDX: ordinary Markdown with optional HTML-like
wrappers for the site's designed components.

## What you can edit safely

- Change any sentence directly.
- Use `**bold text**` for emphasis.
- Use backticks for system codes such as `CH` or `HH`.
- Add, remove, or reorder numbered steps using normal Markdown numbering.

## What to leave in place

Keep the opening and closing `<div>` elements and their `className` values.
They connect the editable content to the site's visual design.

The interactive mapping controls remain in `app/page.tsx`; this file controls
only the teaching copy that appears above them.
