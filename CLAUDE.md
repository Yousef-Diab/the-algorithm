# CLAUDE.md — working guide for this project

Guidance for AI-assisted work on **The Algorithm** — an interactive course built
from ICT's (Inner Circle Trader) Mentorships. Read this before editing anything.

Scope grows over time. Both current sections are live: Section 1 is **ICT Core
(Months 1–4, 38 lessons)**; Section 2 is the **ICT 2022 Mentorship (Parts 1–6,
40 lessons)**.

---

## 1. The one rule that overrides everything

**Course content must come *purely* from the provided source material** — ICT's
mentorship notes and the video transcripts in `transcripts/` for whichever
section is being built. Do **not** add general/outside trading knowledge, invent
examples, or "improve" concepts with information that isn't in the source.

- When enriching a lesson, read the relevant transcript first, then write only
  what it supports.
- Quiz questions and answer explanations must be traceable to the
  notes/transcript, not to outside knowledge.
- If the source is ambiguous, prefer under-claiming over inventing. Flag the gap
  rather than filling it.

If a request seems to need outside knowledge, say so instead of quietly adding
it.

---

## 2. Golden rules

### Build-artifact discipline

The published site is a **static multi-page Astro build** in `dist/`, produced
by `pnpm build` from `src/` + `content/` + `images/`.

- **Never hand-edit anything under `dist/`** — it is build output; any manual
  change is overwritten on the next build.
- Edit source files only, then run `pnpm build` and `pnpm verify`.
- CI fails if the build or verification breaks, so always rebuild and verify
  before finishing a task.
- Node + pnpm are the only tools needed. No runtime dependencies, no external
  requests at runtime (the site is fully offline-capable once built).

### Keep the changelog updated

- Create or update `CHANGELOG.md` **before** reporting a task as done.
- Group entries under `## Unreleased` using the headings `### Added`,
  `### Changed`, `### Fixed`, `### Documentation`, `### Verification`.
- Write human sentences ("Added …", "Fixed …"), not commit logs. Never fabricate
  version numbers or release history — document only what actually changed.

### Protect main

- This repository publishes directly from `main` via GitHub Pages. Do not commit
  or push from `main` unless the user explicitly asks.
- When content changes, commit the `content/` changes together with the rebuilt
  pages — the two must stay in sync.
- Do not `git push` automatically; the user pushes when ready.

### Task planning for large work

- For multi-step tasks, create a short to-do checklist before implementing.
  Break the work into small, independently verifiable tasks.
- Keep exactly one task in progress at a time; update statuses as each step
  completes.
- Skip the checklist for simple one-step edits where a list would add noise.
- After any content or engine change: `pnpm build`, then `pnpm verify`
  (see §8 Verification).

---

## 3. Architecture (current state)

The site is **Astro 7 static output** (multi-page, real URLs per lesson) with
**React islands** for interactivity. Content stays in the same `content/` +
`images/` folders as before and is loaded by **custom Astro loaders** that walk
the folder tree at build time — there is no content migration step.

Rendering is data-driven: `src/content.config.ts` defines the `sections`,
`months` and `lessons` collections (Zod-validated); pages under `src/pages/`
render them; interactive widgets are React islands hydrated with
`client:visible` / `client:idle` / `client:load` directives. Chart counts are
**auto-derived** by counting `images/{slug}-NN.png` for each fig-slot slug.
`scripts/sync-images.mjs` mirrors `images/` into `public/images/` before every
build/dev run — there is no image-count table to maintain.

### Project structure

```text
src/
  pages/                     ← routes (landing, /course, lessons, review, exam, 404)
  layouts/                   ← BaseLayout (head, theme, favicon) + CourseLayout (header, sidebar, lightbox)
  components/                ← .astro components + React islands (.tsx)
    Header.astro             ← topbar (brand + theme switcher)
    ThemeToggle.tsx          ← light / dark / system (client:load)
    Sidebar.tsx              ← course nav + progress (client:idle)
    Quiz.tsx                 ← lesson check (client:visible)
    Exam.tsx                 ← section final exam (client:visible)
    Notes.tsx                ← per-lesson local notes (client:idle)
    LessonFooter.tsx         ← prev / mark complete / next (client:idle)
    ResetPanel.tsx           ← reset controls on /course (client:visible)
    CourseProgress.tsx       ← patches done-counts on /course (client:idle)
    Lightbox.tsx             ← chart lightbox, zoom + pan (client:idle)
    Figure.astro             ← server-side chart figures from fig-slots
    SiteFooter.astro
  lib/
    course.ts                ← types + u() base-URL helper
    graph.ts                 ← getGraph() nested sections→months→lessons
  stores/
    progress.ts              ← nanostores: doneStore + examStore (localStorage)
  styles/
    global.css               ← Tailwind 4 + DaisyUI 5 themes + component CSS
  content.config.ts          ← custom loaders + Zod schemas (walks content/)
content/                     ← course source (same layout as before)
  s1-ict-core/               ← Section 1 (ICT Core, Months 1–4)
  s2-2022-mentorship/        ← Section 2 (2022 Mentorship, Parts 1–6)
    section.js               ← this section's meta ({id, short, title, desc, label?})
    months.js                ← the MONTHS entries for this section
    summary.html             ← the section's revision summary page (optional)
    exam.js                  ← the section's final-exam array literal (optional)
    m1/ m2/ m3/ m4/          ← months (p1…p6 in Section 2)
      m1-01/                 ← one folder per lesson (= lesson id)
        lesson.html          ← the <section class="lesson"> markup, verbatim
        quiz.js              ← this lesson's quiz array literal
        video.txt            ← the source video URL (one line; empty = no link)
images/                      ← {slug}-NN.png chart files (counts auto-derived)
scripts/
  sync-images.mjs            ← copies images/ → public/images (predev/prebuild)
verify.mjs                   ← headless end-to-end checks (Node + Playwright)
public/                      ← copied verbatim to dist (favicon, images mirror)
dist/                        ← BUILD OUTPUT (gitignored, served by GitHub Pages)
transcripts/                 ← source transcripts (git-ignored, local only)
notes/                       ← source notes + charts (git-ignored, local only)
```

### Legacy files (do not touch)

`build.py`, `verify.py`, `engine/` and the old `index.html` are **obsolete** —
they belong to the previous single-file Python build and are left in place for
reference only. Never edit them, never run them, and do not hand-edit
`index.html` (it is stale and will not be updated). The full historical detail
is preserved in §12.

### The data model

- **Sections** come from `content/<section>/section.js`
  (`{id, short, title, desc}`, optional `label` — `"Month"` by default,
  `"Part"` for the 2022 Mentorship).
- **Months** come from each section's `months.js` — one bare `{id, title, desc}`
  per line, **no wrapping array**. Titles use an em-dash: `"Month 1 — Reading
  The Conditions"` (the part before `—` is the sidebar group heading).
- **Meta files are formatter-proof.** `section.js`/`months.js` hold bare `{…}`
  literals and quiz/exam files are bare array literals; a formatter may insert
  stray `;` (reading `{…}` as block statements) and trailing `;` on arrays —
  both are tolerated by the loaders in `src/content.config.ts` (defense is in
  the build). Reformat freely, but re-check the loaders if you change the
  *shape*.
- **Quizzes / exams** are array literals (`[{q, o:[…4…], a, e}, …]`), keyed by
  lesson/section folder id. `a` is the 0-based index of the correct option.
  Trailing `;` is tolerated by the loader.
- **Videos** come from each lesson's `video.txt` (one line, real source URL).
- **Images** are auto-derived from `images/`; a missing image auto-removes its
  figure at runtime, and galleries render when a lesson has more than 2 charts.

---

## 4. Conventions (memorise these)

### Lesson (`content/<section>/<month>/<id>/lesson.html`)

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

- Lesson `id` = `m{month}-{NN}` (zero-padded, e.g. `m4-03`). The folder name
  **must equal** the `id=` in `lesson.html`, and `data-quiz` must match too.
- Slug = `m{month}-{NN}-{kebab-title}` (e.g. `m4-03-orderblocks`), used only in
  `data-slug` for charts. Keep slug and id prefixes in sync — the loaders key
  off the first 5 characters.
- Keep the slots (`lesson-hero`, `fig-slot`, `quiz`, `lesson-footer`) exactly;
  the build fills them. Reuse the styled components; don't invent new CSS.
- Escape `&` as `&amp;` in body copy.

### Quiz (`quiz.js` — bare array literal, keyed by folder id)

```js
[
  {q:"question?",o:["opt0","opt1","opt2","opt3"],a:1,e:"explanation from the notes"},
  …
]
```

- Exactly 4 options; `a` = 0-based index of the correct one.
- Options are **shuffled at render time**, so position is not a tell — just
  mark the correct one with `a`.
- **Balance option lengths** (~within 5 characters) so the correct answer isn't
  conspicuously the longest. Trim the correct option to a concise phrase; flesh
  out terse distractors into plausible, clearly-wrong statements; push the
  nuance/citation into `e`.
- Distractors may be invented (they're wrong on purpose), but the **correct
  option + `e` must stay traceable** to the notes/transcript (see §1).

### Video (`video.txt`)

One line with the **real** source video URL (opens in a new tab). Empty file =
no link rendered. Never invent a URL.

### Charts (`images/`)

Drop `images/{slug}-NN.png` files, `NN` zero-padded from `01`. Counts are
auto-derived by the loader and `scripts/sync-images.mjs` mirrors the folder
into `public/images/` before every build/dev run — there is nothing else to
edit. A missing image auto-removes its figure at runtime, and galleries render
when a lesson has more than 2 charts.

### The chart viewer (lightbox)

`src/components/Lightbox.tsx` (+ `.lb-*` styles in `src/styles/global.css`):

- Clicking a `.fig img` opens the **whole lesson's** set (scoped via
  `.closest('.lesson')`), so prev/next browses it without closing.
- Zoom is expressed **relative to the fitted size** (100% = fit, max 500%,
  step ×1.25); above fit the stage scrolls and the image drags to pan.
- The panel is **pinned**: `.lb-stage` takes all the leftover height
  (`flex:1 1 auto; min-height:0`) so the caption and panel sit at a fixed spot
  regardless of the image's aspect ratio or the zoom level — don't give the
  stage a content-sized height or the panel starts hopping about.
- The stage centres with `align-items: safe center` + `justify-content: safe
  center` — without them the top/left of a zoomed image becomes unreachable.
- Dragging is implemented with **pointer capture** on the stage
  (`stage.setPointerCapture`), and close-on-outside-click only fires when the
  click target is the dialog backdrop (`e.target === e.currentTarget`). After a
  drag, Chromium retargets the follow-up click from the image to the stage, so
  the lightbox won't close mid-drag — verify close-on-outside-click with **real
  mouse input, never `el.click()`** (synthetic clicks bypass the retargeting and
  hide the bug).
- Keyboard while open: `Esc` closes, `←`/`→` browse, `+`/`−` zoom, `0` resets
  to fit. Body scroll locks via `body.lb-lock` and the image re-fits on window
  resize.

### Meta files are formatter-proof — keep them that way

`section.js` and `months.js` hold bare `{…}` object literals (one per line, **no
wrapping array**), which a JS formatter reads as *block statements* and "fixes"
by inserting a `;` before the `}`; array files (`quiz.js`, `exam.js`) get a
trailing `;`. Both are tolerated by the loaders in `src/content.config.ts` —
defense is in the build. So **reformat these files freely**, but if you change
their *shape* (e.g. a nested object, or a `}` inside a string) re-check the
loaders.

### Section review pages

Both optional and independent per section:

- `section.js` is **required** if `summary.html` or `exam.js` exists.
- `summary.html` — authored like a lesson but with `id="{sid}-review"`,
  `data-kind="review"`, and a `<div class="review-footer"></div>` slot instead
  of `.lesson-footer`. It **re-states the existing lessons**; it never adds new
  material (§1 applies).
- `exam.js` — final-exam questions, same shape and authoring rules as `quiz.js`.
  The exam **page** is generated by the route
  `src/pages/course/[section]/exam.astro` (no `exam.html` to write). It grades
  nothing until **Submit**, scores against an 80% pass mark, and can be retaken.
- Review/exam pages carry `data-kind` and are excluded from `LESSONS`, the
  lesson count, the progress bar and the notes boxes.

### State

`localStorage` keys: `ict-done` (completed lesson ids), `ict-quiz` (per-question
grades), `ict-exam` (per-section best/last/taken/picks — picks stored by
**option text**, since options re-shuffle), `ict-notes` (per-lesson notes),
`ict-theme` (`light` | `dark` | `system`), `ict-sidebar-collapsed` (desktop
sidebar collapse). Sidebar scroll position persists per tab in `sessionStorage`
(`ict-sidebar-scroll`). Reset controls live on the course page (`ResetPanel`);
**no reset ever clears `ict-notes`**.

---

## 5. Common tasks — where to change what

**Every change is followed by `pnpm build`, then `pnpm verify`.** `dist/` is
never edited by hand.

| Task | Edit |
|------|------|
| Enrich a lesson | That lesson's `lesson.html` content only. Leave `.fig-slot`, `.quiz`, `.lesson-footer` untouched. |
| Add/upgrade a quiz | That lesson's `quiz.js` (the array literal). |
| Set/change a lesson's video | That lesson's `video.txt` (one line, real source URL). |
| Add charts to a lesson | Drop `images/{slug}-NN.png` files. Count is auto-derived — nothing else to edit. |
| Add a new lesson | New folder `content/<section>/<month>/<id>/` with `lesson.html` (correct id/slug/`data-month`) + `quiz.js` + `video.txt`. Nav/footer/cards/counts update automatically. |
| Add a new month | Add a `{id,title,desc}` entry to that section's `months.js` (em-dash title), then add its lesson folders as above. |
| Add a new section | New `content/<sN-name>/` with `section.js` + `months.js`, then months + lessons as above. |
| Edit a section summary | That section's `summary.html`. Leave the `.review-footer` slot untouched. |
| Add/upgrade a final exam | That section's `exam.js` (same shape and authoring rules as `quiz.js`). The exam page and its question count regenerate themselves. |
| Restyle | `src/styles/global.css` (Tailwind 4 + DaisyUI 5 themes + component CSS). |
| Change rendering/logic | React islands in `src/components/` (rare). |

Scaffolding new lessons, months or whole sections is automated — load the
`add-content` skill (see §10) whenever you add or restructure course content.

---

## 6. Source material & tooling

- **Transcripts:** `transcripts/Month N/…txt` (Section 1) and
  `transcripts/2022 Mentorship/…Episode N.txt` (Section 2) — the primary source
  for lesson enrichment. Git-ignored; local only.
- **Section 2 notes:** `notes/2022-mentorship/ep-NN.md` plus `raw/*.png`,
  harvested from the Notion notes page. Git-ignored. The Notion image URLs
  expire after ~5 minutes, so the local copy is the permanent one — see the plan
  doc before re-fetching.
- **Plans:** `docs/s2-2022-mentorship-plan.md` (Section 2 build plan,
  episode→lesson map, session batching and progress tracker — **read it before
  doing any Section 2 work**) and `docs/s2-2022-mentorship-videos.md`.
- **Mentorship notes & charts:** from ICT's mentorships. Charts are scraped into
  `images/`. The scraper (Playwright, resumable via a manifest) has historically
  lived in the session scratchpad, not the repo.
- **Notes fidelity:** transcripts and ICT's mentorship notes are the *only*
  permitted inputs (see §1). Preserve attribution to the original creators in
  the README's Credits section through any refactor.

---

## 7. Skills

- `add-content` (`.claude/skills/add-content/SKILL.md`) — scaffolds new lessons,
  months, and whole sections (folder layout, templates, `months.js`), then
  builds and verifies. **Load it whenever you add or restructure course
  content.** (Note: it may still reference the old `python build.py` — run
  `pnpm build` + `pnpm verify` instead.)

---

## 8. Verification

### Development workflow

```bash
pnpm dev       # dev server with HMR (runs sync-images first)
pnpm build     # sync images → astro build → dist/
pnpm verify    # headless end-to-end checks against the existing dist/ (run after pnpm build)
pnpm check     # lint + format check (Ultracite + Biome — what CI runs)
pnpm preview   # serve dist/ locally
```

**`pnpm build` then `pnpm verify`.** `verify.mjs` (Node + Playwright) serves the
built `dist/` locally (stripping the `/the-algorithm` base path) and checks —
against expectations derived from `content/`, nothing hard-coded — that:

- every `content/` lesson renders,
- every chart image resolves (no broken figures),
- every quiz renders 4 options, shuffles, grades, and exposes a reset control
  that actually clears the graded state,
- the lightbox opens, browses the lesson's charts, zooms, and closes on an
  outside click but not on a click on the image,
- review + exam pages render, and the exam scores on submit (full answers →
  100% pass) with a working retake,
- a video link renders for each lesson with a non-empty `video.txt`,
- the theme switcher persists,
- there are zero console/page JS errors.

It exits non-zero and lists the problems on any failure. One-time setup:
`pnpm install` then `pnpm exec playwright install chromium`.

**CI** (`.github/workflows/ci.yml`) runs on every PR and push to `main`:
`pnpm install --frozen-lockfile` → `pnpm check` (lint) → `pnpm build` → install
Chromium → `pnpm verify`. `.github/workflows/deploy.yml` publishes `dist/` to
GitHub Pages via `withastro/action@v6` (the `site` + `base` live in
`astro.config.mjs` — paths are `/the-algorithm`; both are overridable at build
time via `SITE_URL` / `BASE_PATH`, e.g. `BASE_PATH=/` for root-level hosts
like Coolify, deployed as a static build with `dist/` as the output).

---

## 9. Lint & format (Ultracite + Biome)

The repo uses the **Ultracite** preset on top of **Biome 2.5.6**
(`biome.jsonc`, devDeps `ultracite` + `@biomejs/biome`).

- `pnpm check` — lint + format check (this is what CI runs).
- `pnpm fix` — auto-fix everything biome considers safe.
- ⚠️ **Never run `pnpm fix` (or `biome check --write`/`--apply`) while
  `assist.actions.source.organizeImports` is enabled for `.astro` files** —
  Biome cannot see component usage in `.astro` templates and **deletes
  frontmatter imports**. The config keeps `organizeImports` off for `*.astro`
  for this reason; re-enable it only if the upstream preset fixes the analysis.
- Scope: `content/`, `.claude/`, `.agents/`, `.vscode/`, `images/`, `public/`,
  `dist/`, `node_modules/`, `transcripts/`, `notes/`, `engine/`, `index.html`
  and `.github/` are excluded from linting — authored course content and legacy
  files are never reformatted.
- Some rules are intentionally relaxed in `biome.jsonc` (inline JSX handlers,
  PascalCase component filenames, conditional JSX with `&&`, `safe center` CSS
  fallbacks, lightbox a11y) with reasons documented in the config or as
  `biome-ignore` comments.

---

## 10. What NOT to do

- ❌ Never hand-edit anything in `dist/` — rebuild instead.
- ❌ Never edit or run the legacy `build.py`, `verify.py`, `engine/` or the
  stale `index.html`.
- ❌ Never add outside trading knowledge or invented examples to lessons,
  quizzes, or summaries.
- ❌ Never invent a `video.txt` URL — use the real source video only.
- ❌ Never change the *shape* of `section.js`/`months.js` (bare `{…}` literals)
  or the quiz/exam arrays without re-checking the loaders in
  `src/content.config.ts` — both are formatter-tolerant and defense is in the
  build.
- ❌ Never let a reset clear `ict-notes`.
- ❌ Don't commit or push from `main` without the user asking; don't push
  automatically.
- ❌ Don't delete files, rewrite git history, or touch `.git` internals.
- ❌ Don't fabricate version numbers or release history in `CHANGELOG.md` —
  document only what actually changed.

---

## 11. Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code
quality standards through automated formatting and linting.

### Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most
issues are automatically fixable.

### Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**.
Focus on clarity and explicit intent over brevity.

**Type Safety & Explicitness**

- Use explicit types for function parameters and return values when they enhance
  clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers — extract constants
  with descriptive names

**Modern JavaScript/TypeScript**

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property
  access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

**Async & Promises**

- Always `await` promises in async functions — don't forget to use the return
  value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

**React & JSX**

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array
  indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

**Error Handling & Debugging**

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully — don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

**Code Organization**

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

**Security**

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

**Performance**

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

**Framework-Specific Guidance**

- **Next.js:** use `<Image>` for images, `next/head` or App Router metadata for
  head elements, Server Components for async data fetching instead of async
  Client Components
- **React 19+:** use ref as a prop instead of `React.forwardRef`
- **Solid/Svelte/Vue/Qwik:** use `class` and `for` attributes (not `className`
  or `htmlFor`)

### Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests — use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat — avoid excessive `describe` nesting

### When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** — Biome can't validate your algorithms
2. **Meaningful naming** — use descriptive names for functions, variables, and
   types
3. **Architecture decisions** — component structure, data flow, and API design
4. **Edge cases** — handle boundary conditions and error states
5. **User experience** — accessibility, performance, and usability
   considerations
6. **Documentation** — add comments for complex logic, but prefer
   self-documenting code

Most formatting and common issues are automatically fixed by Biome. Run
`pnpm dlx ultracite fix` before committing to ensure compliance.

---

## 12. Legacy reference: the previous Python build (history)

> **Do not follow anything in this section.** It preserves the pre-Astro
> `CLAUDE.md` content verbatim for reference. The project has since moved to
> the **Astro static build** described in §3–§8; the legacy files it mentions
> (`build.py`, `verify.py`, `engine/`, `index.html`) are obsolete — never edit
> them, never run them (see "Legacy files (do not touch)" in §3).

### Legacy architecture (as it used to be)

The site used to be **content sources + a small engine, assembled by a build
step into one self-contained `index.html`** (served at
<https://yousef-diab.github.io/the-algorithm/> via GitHub Pages). The *output*
kept every property that mattered — single offline file, no external requests,
no runtime dependencies — but the *source* was split so each change touched one
predictable place. You edited source files, then ran `python build.py`;
`index.html` was a **build artifact** (never hand-edit it). Python 3 was the
only tool needed (no npm, no bundler).

```text
engine/                     ← rendering shell + logic (rarely changes)
  head.html                 ← <head> + <style> (design tokens in :root, @media at 900px)
  shell-top.html            ← <body> … the #sidebar / #main / inner-open markup
  home.html                 ← the landing <section id="home">
  shell-bottom.html         ← inner/main close + #lightbox
  app.js                    ← all app logic (figures, lightbox, flip cards, quizzes, nav,
                              footer, home cards, hash routing). Derives SLUG_BY_ID & LESSONS
                              from the DOM. This was old "Block 3" — rarely needed to change.
content/
  s1-ict-core/              ← a SECTION (s2-…/ would have been a sibling)
    section.js              ← this section's meta ({id, short, title, desc, label?})
    months.js               ← the MONTHS entries for this section (id, title, desc)
    summary.html            ← the section's revision summary page (optional)
    exam.js                 ← the section's final-exam array literal (optional)
    m1/ m2/ m3/ m4/         ← a MONTH per folder
      m1-01/                ← a LESSON per folder (folder name = lesson id)
        lesson.html         ← the <section class="lesson"> markup, verbatim
        quiz.js             ← this lesson's quiz array literal
        video.txt           ← the source video URL (one line; empty = no link)
build.py                    ← walked content/ + engine/ → wrote index.html
index.html                  ← BUILD ARTIFACT (was committed, so GitHub Pages served it)
```

**`build.py` generated the old data objects for you** by scanning `content/`:

- `QUIZZES` ← every `quiz.js`, keyed by lesson-folder id.
- `VIDEOS` ← every `video.txt`, keyed by lesson-folder id.
- `MONTHS` ← each section's `months.js`, in section order.
- `IMG_COUNTS` ← **auto-derived** by counting `images/{slug}-NN.png` for each
  `data-slug` in the lesson HTML. There was no image-count table to maintain —
  drop the PNGs in, rebuild, done.

Rendering was still **data-driven**: lessons declared *slots* (`.fig-slot`,
`.quiz`, `.lesson-footer`) and `app.js` filled them at runtime.

Because the data objects and `app.js` shared **one `<script>` block**, a
`SyntaxError` from a formatted meta file killed the entire app, not just the
mangled table. `build.py` defended against both: it re-emitted
`SECTIONS`/`MONTHS` from the parsed `key:"value"` pairs (`parse_objs`) rather
than pasting the literal, and stripped trailing semicolons off array literals
(`js_literal`).

### Legacy verification notes (SPA era)

`python verify.py` rebuilt `index.html` from source, then loaded it in headless
Chromium and checked — against counts derived from `content/`, nothing
hard-coded — that every lesson was present, every chart resolved, every quiz
rendered 4 options / shuffled / graded / reset, the lightbox opened-browsed-
zoomed-closed correctly, each section's `summary.html` and `exam.js` produced a
page and the exam graded to a real score on submit, a video link rendered for
each non-empty `video.txt`, and there were zero console/page JS errors. It
exited non-zero and listed the problems on any failure. Setup: `pip install
playwright && python -m playwright install chromium`.

Two quirks of the old single-page app worth remembering when reading old
scratchpad notes:

- Only the **active** lesson section was visible (`.visible`); `verify.py`
  worked around this by adding `.visible` to every lesson before checking.
- Routing was hash-based and **did** respond to `hashchange` (browser
  back/forward worked), but `page.goto()` to the same URL with only a different
  fragment is a same-document navigation — the app never re-ran, so it had to be
  driven with `location.hash = …` or a real reload.

### Legacy future direction (as it stood then)

The content/rendering split was **done** — content lived in
`content/<section>/<month>/<id>/` and `build.py` assembled it into the offline
`index.html`. The `section → month → lesson` hierarchy was in place and sections
were first-class in the engine (`SECTIONS` drove the nav grouping, the home
cards and the review pages), so **Section 2 (the 2022 Mentorship) was designed
to drop in as a new `content/s2-…/` sibling** — its own `section.js`,
`months.js`, months/lessons, and its own `summary.html` + `exam.js`. That plan
was completed, then superseded by the Astro migration (this guide).

Adding Section 2 needed three small engine changes, since the rendering — not
the data model — had assumed a single section: the home cards grouped by
section and numbered within it (taking their noun from `section.js`'s `label`),
the sidebar printed a section heading once there was more than one section, and
a month with no lessons yet rendered inert instead of throwing on click.

Principles to preserve going forward (still valid today):

- **Keep it dependency-light and offline-capable.** The built site must stay a
  "just open it" artifact with no runtime fetches.
- **One place per concern.** Adding a lesson touches exactly one folder (§5) —
  keep it that way.
- **Preserve the content principle** (§1) — provenance to the source material
  must survive any change.
- **Keep the verification loop** working end-to-end — `pnpm verify` locally,
  enforced by CI (§8). Update `verify.mjs` if you add a new content type or
  slot.
