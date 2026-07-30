# Follow the Flag

An interactive pathology-informatics lesson about a critical potassium result
whose abnormal-result flag loses its meaning between the LIS and EHR.

## Edit the lesson text

The learner-facing teaching copy is split into clearly named Markdown/MDX files
in [`content/`](content/). Start with
[`content/README.md`](content/README.md), which maps each lesson section to its
editable file and explains which parts are safe to change.

Open a content file on GitHub, select the pencil icon, edit the Markdown, and
commit the change to `main`. GitHub Actions will rebuild and publish the lesson
automatically.

MDX supports ordinary Markdown:

```md
### A heading

Normal paragraph text with **bold emphasis** and codes such as `CH`.

1. First instruction
2. Second instruction
```

Structured text used by system cards, HL7 field explanations, answer choices,
and regression tests is in `content/lesson-data.ts`.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

To produce the static GitHub Pages build:

```bash
npm run build:pages
```

The output is written to `pages-dist/`.

## Deployment

Commits to `main` run `.github/workflows/publish.yml` and deploy the static build
to GitHub Pages.

Published lesson: <https://amromeo.github.io/follow-the-flag/>
