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
    months.js               ← the MONTHS entries for this section (id, title, desc)
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
`.callout`, `.callout.rule`, `.callout.warn` (with a `<span class="tag">Label</span>`), `.kv` (definition rows), `.flip-row` + `.flip` (flip cards), `<h3>` sub-headers, `<ul>`/`<ol>`.

**State:** `localStorage` keys `ict-done` (array of completed lesson ids) and `ict-quiz` (map of `"{quizKey}-{qIndex}" → bool`).

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
| Add a new section | New `content/<sN-name>/` with `months.js`, then months + lessons as above. |
| Restyle | `engine/head.html`: `:root` tokens first; component classes second. |
| Change rendering/logic | `engine/app.js` (rare). |

---

## 5. Verification

**Just run `python verify.py`.** It rebuilds `index.html` from source, then loads it in headless Chromium and checks — against counts derived from `content/`, nothing hard-coded — that:

- every lesson in `content/` is present in the page,
- every chart image resolves (no broken `.fig img`),
- every quiz renders 4 options, shuffles, and grades on click,
- a video link renders for each lesson with a non-empty `video.txt`,
- there are zero console/page JS errors.

It exits non-zero and lists the problems on any failure. Requires Playwright once: `pip install playwright && python -m playwright install chromium`.

`verify.py` and `build.py` are **committed project tooling** — keep them. The "don't commit scripts" habit applies only to *throwaway exploration* scripts (put those in the scratchpad). **CI** (`.github/workflows/ci.yml`) runs `build.py` on every PR, **fails if the committed `index.html` is out of sync with `content/`**, then runs `verify.py` — so a stale artifact or a runtime regression can't merge.

When writing an ad-hoc browser check, remember only the **active** lesson section is visible (`.visible`); `verify.py` works around this by adding `.visible` to every lesson before checking.

---

## 6. Source material & tooling

- **Transcripts:** `transcripts/Month N/…txt` — the primary source for lesson enrichment. Git-ignored; local only.
- **Notion notes & charts:** authored by the trader **Fear.ing** (community: <https://whop.com/vincere-aut-mori/?a=ydiab4>). Charts are scraped from the notes into `images/`. The scraper (Playwright, resumable via a manifest) has historically lived in the session scratchpad, not the repo.
- **Notes fidelity:** the transcripts and Fear.ing's notes are the *only* permitted inputs (see §1). Preserve attribution to the original creators in the README's Credits section through any refactor.

---

## 7. Future direction

The content/rendering split (§2) is **done** — content lives in `content/<section>/<month>/<id>/` and `build.py` assembles it into the offline `index.html`. The `section → month → lesson` hierarchy is in place, so **Section 2 (the 2022 Mentorship) drops in as a new `content/s2-…/` sibling** with no engine changes.

Principles to preserve going forward:

- **Keep it dependency-light and offline-capable.** The built `index.html` must stay a single "just open it" file. Python-only build; no npm/bundler, no runtime fetches.
- **One place per concern.** Adding a lesson touches exactly one folder (§4) — keep it that way.
- **Preserve the content principle** (§1) — provenance to the source material must survive any change.
- **Keep the verification loop** working end-to-end — `python verify.py` locally, enforced by CI (§5). Update `verify.py` if you add a new content type or slot.

Possible next steps when they earn their keep: nesting `MONTHS` under sections in `app.js` for a section switcher in the UI; having CI **build and deploy** Pages from `content/` so `index.html` no longer needs committing at all (removes the "did you rebuild?" step entirely).
