# Editing the lesson

Most learner-facing teaching copy lives in the `.mdx` files in this directory.
MDX is Markdown with a small amount of HTML-like markup used to preserve the
site's layout.

## Where to edit

| File | Content |
| --- | --- |
| `hero.mdx` | Case title and opening scenario |
| `investigation.mdx` | Investigation introduction |
| `message-lab.mdx` | HL7 explanation and message-lab introduction |
| `decision.mdx` | Learner decision prompt |
| `repair-intro.mdx` | Repair-lab introduction |
| `repair-lab.mdx` | Translation explanation and exercise steps |
| `repair-debrief.mdx` | Validation debrief |
| `takeaways.mdx` | Final concepts and key insight |
| `lesson-data.ts` | System cards, HL7 field descriptions, answers, and test data |

## Safe text edits

- Change sentences inside paragraphs and headings.
- Use `**bold text**` for emphasis.
- Use backticks for codes such as `CH` or `HH`.
- Edit normal Markdown headings that begin with `#`, `##`, or `###`.
- Add, remove, or reorder numbered-list items in `repair-lab.mdx`.

Keep HTML-like tags such as `<div>`, `<p>`, and `<article>` in place unless you
also intend to change the visual layout. Their `className` values connect the
content to the site's design.

## Structured content

Content that has to drive an interaction lives in `lesson-data.ts`. Edit the
quoted text there, but preserve property names, commas, brackets, IDs, and codes.
For example, changing a system's `title` or `observation` is safe; changing its
`key` can break the interaction.

## Publishing

Edit a file on GitHub, select **Commit changes**, and commit to `main`. The
GitHub Actions workflow rebuilds and publishes the lesson automatically.
