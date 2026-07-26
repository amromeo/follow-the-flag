# Follow the Flag

An interactive pathology-informatics lesson about a critical potassium result
whose abnormal-result flag loses its meaning between the LIS and EHR.

## Edit the lesson text

The interface-translation teaching copy is in:

```text
content/repair-lab.mdx
```

Open that file on GitHub, select the pencil icon, edit the Markdown, and commit
the change to `main`. GitHub Actions will rebuild and publish the lesson
automatically.

MDX supports ordinary Markdown:

```md
### A heading

Normal paragraph text with **bold emphasis** and codes such as `CH`.

1. First instruction
2. Second instruction
```

Keep the existing wrapper `<div>` elements and their `className` values because
they connect the editable copy to the visual design.

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

Commits to `main` run `.github/workflows/pages.yml` and deploy the static build
to GitHub Pages.
