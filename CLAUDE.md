# CLAUDE.md — working guide for this project

Guidance for AI-assisted work on **The Algorithm** — an interactive course built from Fear.ing's trading material. Read this before editing.

Scope grows over time: Section 1 is **ICT Core (Months 1–4, live)**; Section 2 is the **ICT 2022 Mentorship (planned)**. Fear.ing's own models are **out of scope** (proprietary — do not republish).

---

## 1. The one rule that overrides everything

**Course content must come *purely* from the provided source material** — Fear.ing's Notion notes and the video transcripts in `transcripts/` for whichever section is being built. Do **not** add general/outside trading knowledge, invent examples, or "improve" concepts with information that isn't in the source.

- When enriching a lesson, read the relevant transcript first, then write only what it supports.
- Quiz questions and answer explanations must be traceable to the notes/transcript, not to outside knowledge.
- If the source is ambiguous, prefer under-claiming over inventing. Flag the gap rather than filling it.

If a request seems to need outside knowledge, say so instead of quietly adding it.

---

## 2. Architecture (current state)

Everything is **one self-contained file**: `index.html` (served at <https://yousef-diab.github.io/the-algorithm/> via GitHub Pages). No build step, no external requests, no dependencies. Structure, top to bottom:

1. **`<head>` → `<style>`** — all CSS.
   - `:root { … }` holds design tokens (colors, spacing, type). **Change tokens here, not per-element.**
   - `@media(max-width:900px)` holds the responsive/mobile rules.
2. **`<body>`** — the app shell (`#sidebar`, `#main`, `#lightbox`) and every lesson as a `<section class="lesson">`.
3. **Three `<script>` blocks** at the end:
   - **Block 1 — `MONTHS`**: month metadata (`id`, `title`, `desc`) for nav and home cards.
   - **Block 2 — data**: `IMG_COUNTS` (slug → number of chart images) and `QUIZZES` (lesson id → questions).
   - **Block 3 — app logic**: derives `SLUG_BY_ID` and `LESSONS` from the DOM, then wires figures, lightbox, flip cards, quizzes, nav, footer buttons, home cards and hash routing. **This block rarely needs to change** — most edits are content + the two data objects.

Rendering is **data-driven**: lessons declare *slots*, and the JS fills them.

---

## 3. Conventions (memorise these)

**Lesson section:**

```html
<section class="lesson" id="m4-03" data-title="Orderblocks" data-month="m4">
  <div class="lesson-hero">
    <div class="crumb">Month 4 · Lesson 3</div>
    <h2>Orderblocks</h2>
    <div class="desc">One-line summary.</div>
  </div>

  <!-- content: <h3>, <ul>, .callout, .callout.rule, .callout.warn, .kv, .flip-row -->

  <div class="fig-slot" data-slug="m4-03-orderblocks"></div>   <!-- charts injected here -->
  <div class="quiz" data-quiz="m4-03"></div>                    <!-- quiz injected here  -->
  <div class="lesson-footer"></div>                             <!-- prev/done/next injected here -->
</section>
```

**IDs & slugs:**

- Lesson `id` = `m{month}-{NN}` (e.g. `m3-07`). The JS keys off the **first 5 characters**, so ids must stay `mX-NN`.
- Slug = `m{month}-{NN}-{kebab-title}` (e.g. `m3-07-market-maker-trap-trendline-phantoms`).
- `SLUG_BY_ID` maps id → slug automatically via `slug.slice(0,5)`; keep slug and id prefixes in sync.

**Images:** `images/{slug}-{NN}.png`, `NN` zero-padded from `01`. `IMG_COUNTS[slug]` = how many exist. A missing image auto-removes its `<figure>` (`img.onerror`), so a wrong count fails gracefully but should still be correct. Galleries render when count > 2.

**Quiz object shape:**

```js
"m4-03":[
  { q:"question?", o:["opt0","opt1","opt2","opt3"], a:1, e:"explanation from the notes" },
  …
]
```

`a` is the 0-based index of the correct option. Keep 4 options. Explanations should quote/paraphrase the source.

**Reusable content components** (already styled — reuse, don't reinvent):
`.callout`, `.callout.rule`, `.callout.warn` (with a `<span class="tag">Label</span>`), `.kv` (definition rows), `.flip-row` + `.flip` (flip cards), `<h3>` sub-headers, `<ul>`/`<ol>`.

**State:** `localStorage` keys `ict-done` (array of completed lesson ids) and `ict-quiz` (map of `"{quizKey}-{qIndex}" → bool`).

---

## 4. Common tasks — where to change what

| Task | Edit |
|------|------|
| Enrich a lesson | The `<section>` content only. Leave `.fig-slot`, `.quiz`, `.lesson-footer` untouched. |
| Add/upgrade a quiz | The `QUIZZES` object entry for that lesson id. |
| Add charts to a lesson | Drop `images/{slug}-{NN}.png` files, then bump `IMG_COUNTS[slug]`. |
| Add a new lesson | New `<section>` (correct id/slug/`data-month`) **+** a `QUIZZES` entry **+** `IMG_COUNTS` entry. Nav/footer/cards update automatically. |
| Add a new month | Append to `MONTHS`, then add its lessons as above. |
| Restyle | `:root` tokens first; component classes second. |

---

## 5. Verification

After any edit, confirm the course still works with a headless Playwright pass (Python). Check:

- all `section.lesson` (minus `home`) are present,
- every `<img>` resolves (`naturalWidth > 0`, none `complete && naturalWidth===0`),
- quizzes render and grade on click,
- zero console/page JS errors.

A throwaway script in the session scratchpad is fine; don't commit test scripts to the repo. Load the HTML via a `file://` URI. Note that only the **active** lesson section is visible (`.visible`), so to test a specific lesson, set `location.hash` or drive the quiz nodes directly in JS rather than mouse-clicking hidden elements.

---

## 6. Source material & tooling

- **Transcripts:** `transcripts/Month N/…txt` — the primary source for lesson enrichment. Git-ignored; local only.
- **Notion notes & charts:** authored by the trader **Fear.ing** (community: <https://whop.com/vincere-aut-mori/?a=ydiab4>). Charts are scraped from the notes into `images/`. The scraper (Playwright, resumable via a manifest) has historically lived in the session scratchpad, not the repo.
- **Notes fidelity:** the transcripts and Fear.ing's notes are the *only* permitted inputs (see §1). Preserve attribution to the original creators in the README's Credits section through any refactor.

---

## 7. Future direction (the planned refactor)

Goal: make the course **easily expandable** as new sections are added (the 2022 Mentorship, and more months per section), while staying **AI-development friendly** (predictable, one obvious edit point per change, verifiable). Do this refactor *before* bolting a whole new section onto the single file. Keep these principles:

- **Separate content from rendering.** The single hand-edited HTML file is the main friction point. Options to weigh: extract lessons/quizzes into data (e.g. JSON/Markdown per lesson) rendered by a small template, or split into per-section/per-month files assembled by a lightweight build. A second top-level grouping (**section → month → lesson**) will likely be needed once Section 2 lands.
- **Keep it dependency-light and offline-capable.** The "one file you can just open" property is valuable — don't trade it away without a clear win.
- **One place per concern.** Adding a lesson should touch one predictable set of files, not scattered edits.
- **Preserve the content principle** (§1) through any refactor — provenance to the source material must survive.
- **Keep the verification loop** (§5) working end-to-end.

Until that refactor lands, follow the current conventions in §3–§4.
