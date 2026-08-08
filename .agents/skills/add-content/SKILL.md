---
name: add-content
description: Scaffold new course content for The Algorithm — a lesson, a month, or a whole content group (section). Handles folder layout, file templates, months.js, then builds and verifies. Use when adding any ICT mentorship material to content/.
---

# Add Content — The Algorithm

Scaffold new course content into the `content/` tree, then rebuild and verify.
Everything is **data-driven**: you create folders/files under `content/`, run
`python build.py`, and `index.html` is regenerated. **Never hand-edit
`index.html`** — it is a build artifact.

## The overriding rule (do not skip)

Course content must come **purely from the provided source material** — ICT's
mentorship notes and the transcripts in `transcripts/` for the section being built. Do
**not** add outside trading knowledge or invent examples. The correct quiz option +
its explanation must be traceable to the source; distractors may be invented (they're
wrong on purpose). See `CLAUDE.md` §1.

## Layout recap

```
content/
  <section>/                 e.g. s1-ict-core   (sections sort alphabetically → order)
    months.js                MONTHS entries for THIS section (one {…}, per month, no wrapping array)
    <month>/                 e.g. m1            (months sort alphabetically → order)
      <id>/                  e.g. m1-01         (lessons sort alphabetically → order)
        lesson.html          the <section class="lesson"> markup (verbatim, copied into index.html)
        quiz.js              the quiz array literal for this lesson
        video.txt            one line: the source YouTube URL (or empty = no link)
engine/                      rendering shell + app.js (do NOT touch to add content)
build.py                     walks content/ + engine/ → writes index.html
images/                      {slug}-NN.png ; counts are auto-derived, no table to edit
```

**IDs & slugs**
- Lesson `id` = `m{month}-{NN}` (zero-padded: `m4-03`, `m4-14`). The folder name **must equal** this id, and it must match `id="…"` inside `lesson.html`. The JS keys off the first 5 chars, so keep the `mX-NN` shape.
- Slug = `m{month}-{NN}-{kebab-title}` (e.g. `m3-07-market-maker-trap-trendline-phantoms`). Used only in `data-slug` for charts.
- Zero-pad so alphabetical sort = intended order (`m4-01` … `m4-09`, `m4-10`).

## Task 1 — Add a LESSON

1. `mkdir content/<section>/<month>/<id>/` (id like `m4-15`).
2. Create **lesson.html** from this skeleton (fill the crumb, title, one-line desc, and body):
   ```html
   <section class="lesson" id="m4-15" data-title="Short Title" data-month="m4">
     <div class="lesson-hero">
       <div class="crumb">Month 4 · Lesson 15</div>
       <h2>Short Title</h2>
       <div class="desc">One-line summary from the source.</div>
     </div>

     <!-- body: <h3>, <ul>/<ol>, .callout / .callout.rule / .callout.warn
          (each with <span class="tag">Label</span>), .kv rows, .flip-row + .flip cards -->

     <div class="fig-slot" data-slug="m4-15-short-title"></div>
     <div class="quiz" data-quiz="m4-15"></div>
     <div class="lesson-footer"></div>
   </section>
   ```
   - Keep the three trailing slots (`fig-slot`, `quiz`, `lesson-footer`) exactly — the engine fills them.
   - `data-title` is what the sidebar/nav shows; `data-month` must be the month id.
   - Reuse the styled components; don't invent new CSS. Escape `&` as `&amp;`.
3. Create **quiz.js** — a bare array literal (build.py keys it by folder id):
   ```js
   [
     {q:"question?",o:["opt0","opt1","opt2","opt3"],a:1,e:"explanation traceable to the source"},
     …
   ]
   ```
   - Exactly 4 options; `a` = 0-based index of the correct one.
   - **Quiz-authoring rules** (options are shuffled at render time, so position isn't a tell): keep all four options **comparable in length** (~within 5 chars) so the correct one isn't the obvious longest. Trim the correct option to a concise phrase; flesh terse distractors into plausible wrong statements; push nuance into `e`.
4. Create **video.txt** — one line with the real source video URL, or leave the file empty (renders no link). Never invent a URL.
5. Add charts (optional): drop `images/<slug>-01.png`, `-02.png`, … The count is auto-derived; galleries render when > 2.
6. **Build + verify** (see bottom).

## Task 2 — Add a MONTH

1. `mkdir content/<section>/<month>/` (e.g. `m5`).
2. Append its entry to `content/<section>/months.js` (one line, **no** wrapping array — build.py wraps all sections' entries into `const MONTHS = [ … ]`):
   ```js
     {id:"m5", title:"Month 5 — Theme", desc:"One-sentence description of the month."},
   ```
   Keep entries in month order (they render in the order listed).
3. Add each lesson in that month via **Task 1**.
4. **Build + verify.**

## Task 3 — Add a CONTENT GROUP (section)

Use for a new top-level grouping (e.g. Section 2 = the 2022 Mentorship). Sections are
sibling folders under `content/` and sort alphabetically, so prefix with an ordinal.

1. `mkdir content/s2-<slug>/` (e.g. `content/s2-2022-mentorship/`). Keep the `sN-` prefix so ordering is stable and it sorts after `s1-ict-core`.
2. Create `content/s2-<slug>/months.js` with that section's month entries (same one-line format as Task 2). Month ids can repeat across sections (`m1`…) — they're namespaced by folder — but lesson **folder ids must be globally unique** because the runtime keys quizzes/videos by lesson id. Prefer a section-distinct scheme (e.g. `m1-01` is already used by s1; for s2 use ids like `n1-01` or `s2m1-01`) so ids don't collide. Whatever scheme you pick, the folder name, `id=` in lesson.html, `data-quiz`, and `data-slug` prefix must all agree.
3. Add months (Task 2) and lessons (Task 1) under it.
4. Update the home/README scope if this is a newly-live section. **Respect scope:** only ICT's Mentorships are in scope as source material; see `CLAUDE.md` header.
5. **Build + verify.**

## Build + verify (always, after any change)

```bash
python verify.py         # rebuilds index.html, then headless-checks the whole course
```
This runs `build.py` (which validates ids/quizzes/slugs and aborts on errors) and then
loads the built `index.html` in headless Chromium: every `content/` lesson present,
charts load, quizzes render/shuffle/grade, video links present, zero JS errors. It
prints the counts and exits 0 on success, or lists the problems and exits non-zero.

One-time setup if needed: `pip install playwright && python -m playwright install chromium`.
The same check runs in CI on every PR, so don't skip it. (You rarely need a throwaway
browser script — `verify.py` is the harness; keep any one-off exploration in the scratchpad.)

## Commit note

Commit both the `content/` changes **and** the rebuilt `index.html` together. Do **not**
`git push` automatically — the user pushes when ready.
