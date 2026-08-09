---
title: Add a Month
description: Step-by-step tutorial for adding a new month (or part) to a section — months.js and its lesson folders.
---

A month groups lessons under one heading in the sidebar and on the course
page. Adding one is two steps: register it in `months.js`, then add its lesson
folders.

## Step 1 — Register the month

Open the section's `months.js` and append **one bare object literal per line**
— there is no wrapping array:

```js
{ id: "m4", title: "Month 4 — Orderblocks & ICT Concepts", desc: "…" }
```

```js
// Section 2 example — parts instead of months:
{ id: "p1", title: "Part 1 — Understanding the Model", desc: "…" }
```

### The em-dash rule

The title uses an **em-dash**: the part before `—` is the sidebar group
heading, the part after is the descriptive title.

```text
"Month 1 — Reading The Conditions"
   ↑heading↑        ↑description↑
```

### Id conventions

- `id` is short and unique within the section: `m1`…`mN` for Section 1,
  `p1`…`p6` for Section 2.
- Lessons inside the month are named `{id}-{NN}` (e.g. `m4-01`, `m4-02`).

:::note
Meta files are formatter-proof: a formatter may insert a stray `;` inside
`months.js` (reading `{…}` as a block statement) — the loader tolerates it.
Don't change the *shape* (e.g. wrapping the objects in an array) without
re-checking the loaders in `src/content.config.ts`.
:::

## Step 2 — Add the lesson folders

Create the month's folder and one folder per lesson:

```text
content/<section>/m4/
  m4-01/
    lesson.html
    quiz.js
    video.txt
  m4-02/
    lesson.html
    quiz.js
    video.txt
```

Each lesson follows [Add a Lesson](/content/add-lesson). The month folder
name must match the `id` used in the lesson `data-month` attributes.

## Step 3 — Build and verify

```bash
pnpm build
pnpm verify
```

The new month appears automatically in:

- the sidebar group headings,
- the course page,
- the lesson numbering (crumb: "Month 4 · Lesson 3"),
- progress totals (the lesson count grows).

## Step 4 — Document and commit

- `CHANGELOG.md`: `### Added` — "Added Month N …".
- `README.md`: if the section structure or lesson count merits a mention.
- Docs site: if you documented the section's months (e.g. in
  [Project Structure](/architecture/project-structure) or a plan doc).
- Commit on a feature branch, content together with rebuilt pages.

## Checklist

- [ ] `months.js` has one `{id, title, desc}` line with an em-dash title.
- [ ] Month folder exists and matches the id.
- [ ] All lesson folders follow the [Add a Lesson](/content/add-lesson) checklist.
- [ ] `pnpm build` and `pnpm verify` pass.
- [ ] CHANGELOG / README / docs updated as needed.
