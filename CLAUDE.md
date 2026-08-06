# CLAUDE.md — working guide for this project

Guidance for AI-assisted work on **The Algorithm** — an interactive course built from ICT's Mentorships. Read this before editing.

Scope grows over time. Both current sections are live: Section 1 is **ICT Core (Months 1–4, 38 lessons)**; Section 2 is the **ICT 2022 Mentorship (Parts 1–6, 40 lessons)**.

---

## 1. The one rule that overrides everything

**Course content must come *purely* from the provided source material** — ICT's mentorship notes and the video transcripts in `transcripts/` for whichever section is being built. Do **not** add general/outside trading knowledge, invent examples, or "improve" concepts with information that isn't in the source.

- When enriching a lesson, read the relevant transcript first, then write only what it supports.
- Quiz questions and answer explanations must be traceable to the notes/transcript, not to outside knowledge.
- If the source is ambiguous, prefer under-claiming over inventing. Flag the gap rather than filling it.

If a request seems to need outside knowledge, say so instead of quietly adding it.

---

## 2. Architecture (current state)

The site is **content sources + a small engine, assembled by a build step into one self-contained `index.html`** (served at <https://yousef-diab.github.io/the-algorithm/> via GitHub Pages). The *output* keeps every property that mattered before — single offline file, no external requests, no runtime dependencies — but the *source* is now split so each change touches one predictable place.

**You edit source files, then run `python build.py`.** `index.html` is a **build artifact** — never hand-edit it; your change will be overwritten on the next build. Python 3 is the only tool needed (no npm, no bundler).

```text
engine/                     ← rendering shell + logic (rarely changes)
  head.html                 ← <head> + <style> (design tokens in :root, @media at 900px)
  shell-top.html            ← <body> … the #sidebar / #main / inner-open markup
  home.html                 ← the landing <section id="home">
  shell-bottom.html         ← inner/main close + #lightbox
  app.js                    ← all app logic (figures, lightbox, flip cards, quizzes, nav,
                              footer, home cards, hash routing). Derives SLUG_BY_ID & LESSONS
                              from the DOM. This is old "Block 3" — rarely needs to change.
content/
  s1-ict-core/              ← a SECTION (Section 2 will be a sibling, e.g. s2-mentorship/)
    section.js              ← this section's meta ({id, short, title, desc, label?})
    months.js               ← the MONTHS entries for this section (id, title, desc)
    summary.html            ← the section's revision summary page (optional)
    exam.js                 ← the section's final-exam array literal (optional)
    m1/ m2/ m3/ m4/         ← a MONTH per folder
      m1-01/                ← a LESSON per folder (folder name = lesson id)
        lesson.html         ← the <section class="lesson"> markup, verbatim
        quiz.js             ← this lesson's quiz array literal (see §3 shape)
        video.txt           ← the source video URL (one line; empty = no link)
build.py                    ← walks content/ + engine/ → writes index.html
index.html                  ← BUILD ARTIFACT (committed, so GitHub Pages serves it)
```

**`build.py` generates the old data objects for you** by scanning `content/`:
- `QUIZZES` ← every `quiz.js`, keyed by lesson-folder id.
- `VIDEOS` ← every `video.txt`, keyed by lesson-folder id.
- `MONTHS` ← each section's `months.js`, in section order.
- `IMG_COUNTS` ← **auto-derived** by counting `images/{slug}-NN.png` for each `data-slug` in the lesson HTML. **There is no image-count table to maintain** — drop the PNGs in, rebuild, done.

Rendering is still **data-driven**: lessons declare *slots* (`.fig-slot`, `.quiz`, `.lesson-footer`) and `app.js` fills them at runtime — exactly as before.

---

## 3. Conventions (memorise these)

**Lesson section** (lives in `content/<section>/<month>/<id>/lesson.html`):

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

**Images:** `images/{slug}-{NN}.png`, `NN` zero-padded from `01`. Counts are **auto-derived by `build.py`** — just drop the PNGs in `images/` and rebuild; there is no count to type. A missing image also auto-removes its `<figure>` at runtime (`img.onerror`). Galleries render when count > 2.

**Chart viewer (lightbox).** Clicking a chart opens the **whole lesson's** set (`img.closest('.lesson')`), so prev/next browses it without closing. Zoom is expressed **relative to the fitted size** (100% = fit, max 500%); above fit the stage scrolls and the image drags to pan. The panel is **pinned**: `.lb-stage` takes all the leftover height (`flex:1;min-height:0`) so the caption and panel sit at a fixed spot regardless of the image's aspect ratio or the zoom level — don't give the stage a content-sized height or the panel starts hopping about. Three traps if you touch it: (1) the zoomed stage holds a **pointer capture**, so Chromium retargets the follow-up `click` from the image to the stage — `lbHitsImage()` hit-tests the image rect instead of trusting `e.target`, and you must **test close-on-outside-click with real mouse input, never `el.click()`** (synthetic clicks pass through the `e.target` fallback and hide the bug); (2) the stage centres with `align-items:safe center`, without which the top/left of a zoomed image becomes unreachable.

**Lesson video (rule):** every lesson opens with a link to its source video. Put the URL (one line) in that lesson's `video.txt`; `build.py` emits `VIDEOS["mX-NN"]` and the JS injects a `.lesson-video` link right after the lesson's `.lesson-hero` — no HTML edit needed. An empty `video.txt` renders nothing (graceful). Use the **real** source video URL only; never invent one (see §1). It opens in a new tab (external link, so it doesn't break the offline property until clicked).

**Quiz object shape** (the array literal in that lesson's `quiz.js` — `build.py` keys it by the folder id):

```js
[
  { q:"question?", o:["opt0","opt1","opt2","opt3"], a:1, e:"explanation from the notes" },
  …
]
```

`a` is the 0-based index of the correct option. Keep 4 options. Explanations should quote/paraphrase the source.

**Quiz-authoring rules (so answers aren't guessable):**

- **Position is handled for you** — the renderer Fisher-Yates *shuffles* each question's options on load, so the `a` index no longer sets the on-screen position. Don't try to fix a "good" position; just mark the correct one with `a`.
- **Balance option lengths.** The correct answer must *not* be conspicuously the longest — keep all four options comparable in length (aim within ~5 characters). Trim the correct option to a concise phrase and flesh out terse distractors into plausible, clearly-wrong statements. Push the nuance/citation into `e`, not the option text.
- Distractors don't need to be source-traceable (they're wrong on purpose), but the **correct option + `e` must stay traceable** to the notes/transcript (see §1).

**Reusable content components** (already styled — reuse, don't reinvent):
`.callout`, `.callout.rule`, `.callout.warn` (with a `<span class="tag">Label</span>`), `.kv` (definition rows), `.flip-row` + `.flip` (flip cards), `<h3>` sub-headers, `<h4>` (with an optional `<span class="src">(L4)</span>` lesson pointer), `<ul>`/`<ol>`.

**Section review pages.** A section can add two revision pages, both optional and independent:

- `content/<section>/section.js` — one object literal `{id, short, title, desc}`. **Required** if `summary.html` or `exam.js` exists; `id` is the section id (e.g. `s1`) that both page ids derive from. Optional `label` names that section's middle tier on the home cards — `"Month"` when absent, `"Part"` for the 2022 Mentorship. Any other field you add flows straight through into `SECTIONS`.
- `content/<section>/summary.html` — the revision page, authored like a lesson but with `id="{sid}-review"`, `data-kind="review"`, and a `<div class="review-footer"></div>` slot instead of `.lesson-footer`. Its content must still obey §1: it **re-states the existing lessons**, it never adds new material.
- `content/<section>/exam.js` — the final-exam questions, same array shape as `quiz.js` (and the same authoring rules below). The exam **page** is generated by `build.py` from `section.js` — there is no `exam.html` to write.

**Meta files are formatter-proof — keep them that way.** `section.js` and `months.js` hold bare `{…}` object literals, which a JS formatter reads as *block statements* and "fixes" by inserting a `;` before the `}`; array files (`quiz.js`, `exam.js`) get a trailing `;`. Either one used to emit a `SyntaxError` into `index.html` — and because the data objects and `app.js` share **one `<script>` block**, that kills the entire app, not just the mangled table. `build.py` now defends against both: it re-emits `SECTIONS`/`MONTHS` from the parsed `key:"value"` pairs (`parse_objs`) rather than pasting the literal, and strips trailing semicolons off array literals (`js_literal`). So **reformat these files freely**, but if you change their *shape* (e.g. a nested object, or a `}` inside a string) re-check those two helpers.

Review pages are `.lesson` sections so routing works, but they carry `data-kind`, so they are excluded from `LESSONS`, the lesson count, the progress bar and the notes boxes. `build.py` derives `SECTIONS` (with each section's `months`, `review` and `exam` ids) and `EXAMS`. Unlike a lesson check, the exam grades nothing until **Submit**, scores against an 80% pass mark, and can be retaken.

**State:** `localStorage` keys `ict-done` (array of completed lesson ids), `ict-quiz` (map of `"{quizKey}-{qIndex}" → bool`), `ict-exam` (map of section id → `{best, last, taken, submitted, picks}`; `picks` are stored by **option text**, since options re-shuffle on every render) and `ict-notes` (map of lesson id → text). Reset controls live on the home page (`#reset-panel`) and in each quiz header; **no reset ever clears `ict-notes`**.

---

## 4. Common tasks — where to change what

**Every change is followed by `python build.py`, then the §5 verification.** `index.html` is never edited by hand.

| Task | Edit |
|------|------|
| Enrich a lesson | That lesson's `lesson.html` content only. Leave `.fig-slot`, `.quiz`, `.lesson-footer` untouched. |
| Add/upgrade a quiz | That lesson's `quiz.js` (the array literal). |
| Set/change a lesson's video | That lesson's `video.txt` (one line, real source URL). |
| Add charts to a lesson | Drop `images/{slug}-{NN}.png` files. Count is auto-derived — nothing else to edit. |
| Add a new lesson | New folder `content/<section>/<month>/<id>/` with `lesson.html` (correct id/slug/`data-month`) + `quiz.js` + `video.txt`. Nav/footer/cards/counts update automatically. |
| Add a new month | Add a `{id,title,desc}` entry to that section's `months.js`, then add its lesson folders as above. |
| Add a new section | New `content/<sN-name>/` with `section.js` + `months.js`, then months + lessons as above. |
| Edit a section summary | That section's `summary.html`. Leave the `.review-footer` slot untouched. |
| Add/upgrade a final exam | That section's `exam.js` (same shape and authoring rules as `quiz.js`). The exam page and its question count regenerate themselves. |
| Restyle | `engine/head.html`: `:root` tokens first; component classes second. |
| Change rendering/logic | `engine/app.js` (rare). |

---

## 5. Verification

**Just run `python verify.py`.** It rebuilds `index.html` from source, then loads it in headless Chromium and checks — against counts derived from `content/`, nothing hard-coded — that:

- every lesson in `content/` is present in the page,
- every chart image resolves (no broken `.fig img`),
- every quiz renders 4 options, shuffles, and grades on click,
- every quiz exposes a reset control that actually clears the graded state,
- the lightbox opens, browses the lesson's charts, zooms, and closes on an outside click but not on a click on the image,
- each section's `summary.html` and `exam.js` produce a page, and the exam grades to a real score on submit,
- a video link renders for each lesson with a non-empty `video.txt`,
- there are zero console/page JS errors.

It exits non-zero and lists the problems on any failure. Requires Playwright once: `pip install playwright && python -m playwright install chromium`.

`verify.py` and `build.py` are **committed project tooling** — keep them. The "don't commit scripts" habit applies only to *throwaway exploration* scripts (put those in the scratchpad). **CI** (`.github/workflows/ci.yml`) runs `build.py` on every PR, **fails if the committed `index.html` is out of sync with `content/`**, then runs `verify.py` — so a stale artifact or a runtime regression can't merge.

When writing an ad-hoc browser check, remember only the **active** lesson section is visible (`.visible`); `verify.py` works around this by adding `.visible` to every lesson before checking. Routing is hash-based and **does** respond to `hashchange` (browser back/forward works), but `page.goto()` to the same URL with only a different fragment is a same-document navigation — the app never re-runs, so drive it with `location.hash = …` or a real reload.

---

## 6. Source material & tooling

- **Transcripts:** `transcripts/Month N/…txt` (Section 1) and `transcripts/2022 Mentorship/…Episode N.txt` (Section 2) — the primary source for lesson enrichment. Git-ignored; local only.
- **Section 2 notes:** `notes/2022-mentorship/ep-NN.md` plus `raw/*.png`, harvested from the Notion notes page. Git-ignored. The Notion image URLs expire after 5 minutes, so the local copy is the permanent one — see the plan doc before re-fetching.
- **Mentorship notes & charts:** from ICT's (Inner Circle Trader) mentorships. Charts are scraped from the notes into `images/`. The scraper (Playwright, resumable via a manifest) has historically lived in the session scratchpad, not the repo.
- **Notes fidelity:** the transcripts and ICT's mentorship notes are the *only* permitted inputs (see §1). Preserve attribution to the original creators in the README's Credits section through any refactor.

---

## 7. Future direction

The content/rendering split (§2) is **done** — content lives in `content/<section>/<month>/<id>/` and `build.py` assembles it into the offline `index.html`. The `section → month → lesson` hierarchy is in place and sections are first-class in the engine (`SECTIONS` drives the nav grouping, the home cards and the review pages), so **Section 2 (the 2022 Mentorship) drops in as a new `content/s2-…/` sibling** — its own `section.js`, `months.js`, months/lessons, and its own `summary.html` + `exam.js`.

**Section 2 is complete** — 40 lessons (one per episode, 28 omitted), a `summary.html` and a 40-question `exam.js`. Its build plan, episode→lesson map, session batching and progress tracker live in [`docs/s2-2022-mentorship-plan.md`](docs/s2-2022-mentorship-plan.md) — **read that before doing any Section 2 work.** Its source material sits in the git-ignored `notes/2022-mentorship/` (notes prose per episode, plus the charts harvested from Notion) alongside `transcripts/2022 Mentorship/`.

Adding it needed three small engine changes, since the rendering — not the data model — had assumed a single section: the home cards now group by section and number within it (taking their noun from `section.js`'s `label`), the sidebar prints a section heading once there is more than one section, and a month with no lessons yet renders inert instead of throwing on click.

Principles to preserve going forward:

- **Keep it dependency-light and offline-capable.** The built `index.html` must stay a single "just open it" file. Python-only build; no npm/bundler, no runtime fetches.
- **One place per concern.** Adding a lesson touches exactly one folder (§4) — keep it that way.
- **Preserve the content principle** (§1) — provenance to the source material must survive any change.
- **Keep the verification loop** working end-to-end — `python verify.py` locally, enforced by CI (§5). Update `verify.py` if you add a new content type or slot.

Possible next steps when they earn their keep: a section switcher in the sidebar once there is more than one section (the `SECTIONS` data it needs already exists); having CI **build and deploy** Pages from `content/` so `index.html` no longer needs committing at all (removes the "did you rebuild?" step entirely).
