---
title: Add Charts to a Lesson
description: Tutorial — dropping chart PNGs into images/, naming rules, and how the build picks them up.
---

Charts are the easiest content to add: drop correctly-named PNG files into
`images/` and rebuild. The count is auto-derived — there is nothing else to
edit.

## Step 1 — Get the chart images

Charts come from ICT's notes. The local copies are the permanent ones:

- Section 1: `notes/ict-core/` (harvested from the Notion notes site).
- Section 2: `notes/2022-mentorship/raw/*.png`.

:::caution
Notion image URLs expire after ~5 minutes — the local copies in `notes/` are
the permanent source. Don't link remote Notion URLs.
:::

## Step 2 — Name them correctly

Find the lesson's fig-slot slug in its `lesson.html`:

```html
<div class="fig-slot" data-slug="m4-03-orderblocks"></div>
```

Name the files `{slug}-NN.png`, zero-padded from `01`:

```text
images/m4-03-orderblocks-01.png
images/m4-03-orderblocks-02.png
images/m4-03-orderblocks-03.png
```

- The slug prefix is the first 5 characters of the id (`m4-03`) + the kebab
  title — keep them in sync with the lesson id.
- Continue the existing sequence when adding to a lesson that already has
  charts.

## Step 3 — Rebuild

```bash
pnpm build
```

`prebuild` runs `scripts/sync-images.mjs`, mirroring `images/` into
`public/images/` so the new charts are included.

## Step 4 — Verify

```bash
pnpm verify
```

`verify` checks that **every chart image resolves** — a typo in a filename
shows up as a broken figure here.

## What changes automatically

| Chart count | Result |
| --- | --- |
| 0 | No figure rendered (auto-removed). |
| 1–2 | A regular figure. |
| > 2 | A **gallery** renders. |

Clicking any figure opens the lesson's full chart set in the lightbox — see
[Lightbox](/components/lightbox).

## Checklist

- [ ] PNGs named `images/{slug}-NN.png` exactly.
- [ ] `data-slug` prefix matches the lesson id (first 5 chars).
- [ ] Sequence continues from the highest existing `NN`.
- [ ] `pnpm build` && `pnpm verify` pass (no broken figures).
