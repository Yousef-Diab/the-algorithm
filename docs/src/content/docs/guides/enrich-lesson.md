---
title: Enrich a Lesson
description: Tutorial — how to enrich an existing lesson with content from the source material, safely.
---

Enriching a lesson means expanding its `lesson.html` body with content that
comes **purely** from the source material. This is the most common content
task, and the one where the content rule matters most.

## Step 1 — Read the source first

Before writing anything, read the relevant source material:

- **The transcript** for the lesson:
  - Section 1: `transcripts/Month N/…txt`
  - Section 2: `transcripts/2022 Mentorship/…Episode N.txt`
- **ICT's notes** (the notes are often what a lesson was actually written
  from):
  - Section 1: `notes/ict-core/mN-NN.md`
  - Section 2: `notes/2022-mentorship/ep-NN.md`

:::tip
For Section 2, read `docs/s2-2022-mentorship-plan.md` first — it holds the
episode→lesson map, session batching and the progress tracker.
:::

Then open the lesson's current `lesson.html`:

```text
content/<section>/<month>/<id>/lesson.html
```

## Step 2 — Write only what the source supports

The body goes between the `.lesson-hero` and the `.fig-slot`:

```html
<div class="lesson-hero">
  <div class="crumb">Month 4 · Lesson 3</div>
  <h2>Orderblocks</h2>
  <div class="desc">One-line summary.</div>
</div>

<!-- ENRICH HERE: <h3>, <ul>/<ol>, .callout / .callout.rule / .callout.warn,
     .kv rows, .flip-row + .flip cards -->

<div class="fig-slot" data-slug="m4-03-orderblocks"></div>
<div class="quiz" data-quiz="m4-03"></div>
<div class="lesson-footer"></div>
```

Rules:

- Use the **existing styled components** — don't invent new CSS or markup.
- Escape `&` as `&amp;`.
- **Only what the transcript/notes support.** If the source is ambiguous,
  prefer under-claiming over inventing — flag the gap rather than filling it.
- **Never** add outside trading knowledge or invented examples.

## Step 3 — Leave the slots untouched

Do **not** touch `.fig-slot`, `.quiz` or `.lesson-footer` while enriching —
the build fills them.

## Step 4 — Build and verify

```bash
pnpm build
pnpm verify
```

`verify` checks every lesson renders without errors — a malformed body
(fewer/more slots, broken markup) fails the build.

## Step 5 — Document and commit

- `CHANGELOG.md`: `### Changed` — "Enriched lesson X with …".
- `README.md`: skip for lesson-content edits (it doesn't change).
- Docs site: skip unless the change alters something documented (e.g. the
  lesson→episode mapping — then update `s2-2022-mentorship-plan.md`).
- Commit content together with rebuilt pages, on a feature branch.

## Checklist

- [ ] Read the transcript and/or notes for the lesson first.
- [ ] Added body content the source supports (styled components only).
- [ ] `.fig-slot`, `.quiz`, `.lesson-footer` untouched.
- [ ] `&` escaped; no invented examples or outside knowledge.
- [ ] `pnpm build` && `pnpm verify` pass.
- [ ] CHANGELOG updated.
