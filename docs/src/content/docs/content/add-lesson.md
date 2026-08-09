---
title: Add a Lesson
description: Step-by-step tutorial for adding a new lesson — folder layout, lesson.html, quiz.js, video.txt, then build and verify.
---

Adding a lesson touches **exactly one folder**. Navigation, counts, figures,
quizzes and the prev/next footer all update automatically — you register
nothing.

:::tip
Scaffolding is automated by the `add-content` skill (`.claude/skills/`) —
load it whenever you add or restructure course content. This page documents
the same steps manually so you understand exactly what the skill does.
:::

## Step 1 — Create the folder

Inside the target month's folder, create a folder named after the lesson id:

```text
content/<section>/<month>/<id>/
```

For example, the third lesson of Month 4 in Section 1:

```text
content/s1-ict-core/m4/m4-03/
```

The **folder name must equal the lesson id** — the loaders key off it.

## Step 2 — Write `lesson.html`

Use the canonical template — keep the slots exactly as they are; the build
fills them:

```html
<section class="lesson" id="m4-03" data-title="Orderblocks" data-month="m4">
  <div class="lesson-hero">
    <div class="crumb">Month 4 · Lesson 3</div>
    <h2>Orderblocks</h2>
    <div class="desc">One-line summary.</div>
  </div>

  <!-- body: <h3>, <ul>/<ol>, .callout / .callout.rule / .callout.warn
       (each with <span class="tag">Label</span>), .kv rows, .flip-row + .flip cards -->

  <div class="fig-slot" data-slug="m4-03-orderblocks"></div>
  <div class="quiz" data-quiz="m4-03"></div>
  <div class="lesson-footer"></div>
</section>
```

### Ids, slugs and data attributes

| Attribute | Value | Rule |
| --- | --- | --- |
| `id` | `m4-03` | `m{month}-{NN}`, zero-padded; equals folder name |
| `data-title` | `Orderblocks` | The lesson title |
| `data-month` | `m4` | Parent month id |
| `data-slug` (on `.fig-slot`) | `m4-03-orderblocks` | `m{month}-{NN}-{kebab-title}`; charts use this prefix |
| `data-quiz` (on `.quiz`) | `m4-03` | Must equal the lesson id |

Keep slug and id prefixes in sync — the loaders key off the first 5
characters (`m4-03`).

### Body conventions

- Use the **existing styled components**: `<h3>`, `<ul>`/`<ol>`,
  `.callout` / `.callout.rule` / `.callout.warn` (each with a
  `<span class="tag">Label</span>`), `.kv` rows, `.flip-row` + `.flip` cards.
- **Don't invent new CSS or new markup conventions.**
- Escape `&` as `&amp;` in body copy.
- Content must come purely from the source material — see
  [Content Rules](/content/rules).

## Step 3 — Write `quiz.js`

A bare array literal of question objects:

```js
[
  {q:"question?",o:["opt0","opt1","opt2","opt3"],a:1,e:"explanation from the notes"},
  …
]
```

- Exactly 4 options; `a` = 0-based index of the correct one.
- Options are shuffled at render time.
- Balance option lengths; keep the correct option + `e` traceable to the
  source.

See [Quizzes](/content/quizzes) for the full authoring guide.

## Step 4 — Write `video.txt`

One line with the **real** source video URL:

```text
https://www.youtube.com/watch?v=…
```

- Opens in a new tab.
- **Empty file = no link rendered.**
- **Never invent a URL** — use the real source video only.

## Step 5 — Add charts (optional)

Drop PNG files into `images/` named after the fig-slot slug:

```text
images/m4-03-orderblocks-01.png
images/m4-03-orderblocks-02.png
```

- Count is auto-derived — nothing else to edit.
- More than 2 charts → a gallery renders.

See [Charts](/content/charts).

## Step 6 — Build and verify

```bash
pnpm build
pnpm verify
```

- `pnpm build` fails if the folder structure, ids or meta files violate the
  Zod schemas.
- `pnpm verify` checks that the new lesson renders, its quiz works, its
  figures resolve, and its video link renders (if present).

## Step 7 — Document and commit

- Update `CHANGELOG.md` (add a `### Added` entry under `## Unreleased`).
- Update `README.md` if the lesson count or structure changed.
- Update the docs site if this changes something documented.
- Commit the `content/` changes **together with the rebuilt pages** on a
  feature branch (never `main`).

## Checklist

- [ ] Folder named exactly like the lesson id.
- [ ] `lesson.html` keeps the hero / fig-slot / quiz / footer slots.
- [ ] `data-quiz` matches the id; `data-slug` prefix matches.
- [ ] `quiz.js` has 4 options per question, balanced lengths, traceable `e`.
- [ ] `video.txt` has a real URL (or is empty).
- [ ] Charts (if any) named `{slug}-NN.png`.
- [ ] `pnpm build` and `pnpm verify` pass.
- [ ] CHANGELOG / README / docs updated as needed.
