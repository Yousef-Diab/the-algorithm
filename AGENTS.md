# AGENTS.md — Agent instructions for The Algorithm

An interactive, self-contained course built from ICT's (Inner Circle Trader)
Mentorships. This file tells AI agents how to work safely in this repository.
Read it before editing anything. Scope grows over time — both current sections
are live: Section 1 is **ICT Core (Months 1–4, 38 lessons)**; Section 2 is the
**ICT 2022 Mentorship (Parts 1–6, 40 lessons)**.

---

## Golden Rule: Content purity (do not skip)

**Course content must come *purely* from the provided source material** — ICT's
mentorship notes and the video transcripts in `transcripts/` for whichever
section is being built. This overrides everything else in this file:

- When enriching a lesson, read the relevant transcript first, then write only
  what it supports.
- Quiz questions and answer explanations must be traceable to the
  notes/transcript, not to outside knowledge.
- If the source is ambiguous, **under-claim rather than invent**. Flag the gap
  instead of filling it.
- If a request seems to need outside knowledge, say so instead of quietly
  adding it.

## Golden Rule: Build-artifact discipline

The published site is a **static multi-page Astro build** in `dist/`, produced
by `pnpm build` from `src/` + `content/` + `images/`.

- **Never hand-edit anything under `dist/`** — it is build output. Any manual
  change is overwritten on the next build.
- Edit source files only, then run `pnpm build` and `pnpm verify`.
- CI fails if the build or verification breaks, so always rebuild and verify
  before finishing a task.
- Node + pnpm are the only tools needed. No runtime dependencies, no external
  requests at runtime (the site is fully offline-capable once built).

## Task planning for large work

- For multi-step tasks, create a short to-do checklist before implementing.
  Break the work into small, independently verifiable tasks.
- Keep exactly one task in progress at a time; update statuses as each step
  completes.
- Skip the checklist for simple one-step edits where a list would add noise.
- After any content or engine change: `pnpm build`, then `pnpm verify`
  (see Verification below).

## Golden Rule: Keep the changelog updated

- Create or update `CHANGELOG.md` **before** reporting a task as done.
- Group entries under `## Unreleased` using the headings `### Added`,
  `### Changed`, `### Fixed`, `### Documentation`, `### Verification`.
- Write entries as human sentences ("Added …", "Fixed …"), not commit logs.

## Golden Rule: Protect main

- This repository publishes directly from `main` via GitHub Pages. Do not
  commit or push from `main` unless the user explicitly asks.
- When content changes, commit the `content/` changes together with the
  rebuilt pages — the two must stay in sync.
- Do not `git push` automatically; the user pushes when ready.

---

## Architecture overview

The site is **Astro 7 static output** (multi-page, real URLs per lesson) with
**React islands** for interactivity. Content stays in the same `content/` +
`images/` folders as before and is loaded by **custom Astro loaders** that walk
the folder tree at build time — there is no content migration step.

Rendering is data-driven: `src/content.config.ts` defines the `sections`,
`months` and `lessons` collections (Zod-validated); pages under `src/pages/`
render them; interactive widgets are React islands hydrated with
`client:visible` / `client:idle` / `client:load` directives. Chart counts are
**auto-derived** by counting `images/{slug}-NN.png` for each fig-slot slug.

## Project structure

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

## Legacy files (do not touch)

`build.py`, `verify.py`, `engine/` and the old `index.html` are **obsolete** —
they belong to the previous single-file Python build and are left in place for
reference only. Never edit them, never run them, and do not hand-edit
`index.html` (it is stale and will not be updated).

## The data model

- **Sections** come from `content/<section>/section.js`
  (`{id, short, title, desc}`, optional `label` — `"Month"` by default,
  `"Part"` for the 2022 Mentorship).
- **Months** come from each section's `months.js` — one bare `{id, title, desc}`
  per line, **no wrapping array**. Titles use an em-dash: `"Month 1 — Reading
  The Conditions"` (the part before `—` is the sidebar group heading).
- **Quizzes / exams** are array literals (`[{q, o:[…4…], a, e}, …]`), keyed by
  lesson/section folder id. `a` is the 0-based index of the correct option.
  Trailing `;` is tolerated by the loader.
- **Videos** come from each lesson's `video.txt` (one line, real source URL).
- **Images** are auto-derived from `images/`; a missing image auto-removes its
  figure at runtime, and galleries render when a lesson has more than 2 charts.

## Content authoring

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
  `data-slug` for charts. Keep slug and id prefixes in sync — the JS keys off
  the first 5 characters.
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
  option + `e` must stay traceable** to the notes/transcript.

### Video (`video.txt`)

One line with the **real** source video URL (opens in a new tab). Empty file =
no link rendered. Never invent a URL.

### Charts (`images/`)

Drop `images/{slug}-NN.png` files, `NN` zero-padded from `01`. Counts are
auto-derived by the loader and `scripts/sync-images.mjs` mirrors the folder
into `public/images/` before every build/dev run — there is nothing else to
edit.

## Section review pages

Both optional and independent per section:

- `section.js` is **required** if `summary.html` or `exam.js` exists.
- `summary.html` — authored like a lesson but with `id="{sid}-review"`,
  `data-kind="review"`, and a `<div class="review-footer"></div>` slot instead
  of `.lesson-footer`. It **re-states the existing lessons**; it never adds new
  material (§1 applies).
- `exam.js` — final-exam questions, same shape and authoring rules as `quiz.js`.
  The exam **page** is generated by the route `src/pages/course/[section]/exam.astro`
  (no `exam.html` to write). It grades nothing until **Submit**, scores against
  an 80% pass mark, and can be retaken.
- Review/exam pages carry `data-kind` and are excluded from `LESSONS`, the
  lesson count, the progress bar and the notes boxes.

## State

`localStorage` keys: `ict-done` (completed lesson ids), `ict-quiz` (per-question
grades), `ict-exam` (per-section best/last/taken/picks — picks stored by
**option text**, since options re-shuffle), `ict-notes` (per-lesson notes),
`ict-theme` (`light` | `dark` | `system`). Reset controls live on the course
page (`ResetPanel`); **no reset ever clears `ict-notes`**.

## Development workflow

```bash
pnpm dev       # dev server with HMR (runs sync-images first)
pnpm build     # sync images → astro build → dist/
pnpm verify    # build + headless end-to-end checks in Chromium (Playwright)
pnpm preview   # serve dist/ locally
```

One-time setup for `verify.mjs`: `pnpm install` then `pnpm exec playwright
install chromium`. CI (`.github/workflows/ci.yml`) installs pnpm deps, builds,
installs Chromium and runs `pnpm verify` on every PR and push to `main`;
`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages via
`withastro/action@v6` (the `site` + `base` live in `astro.config.mjs` — paths
are `/the-algorithm`).

`verify.mjs` checks: every `content/` lesson renders, every chart resolves,
quizzes render 4 options / shuffle / grade / reset, the lightbox opens-browses-
zooms-closes correctly, review + exam pages render and the exam scores on
submit, video links appear for non-empty `video.txt`, the theme switcher
persists, and there are zero console errors. Exit 0 with a count summary, or
non-zero listing the problems.

## Skills

- `add-content` (`.claude/skills/add-content/SKILL.md`) — scaffolds new lessons,
  months, and whole sections (folder layout, templates, `months.js`), then
  builds and verifies. **Load it whenever you add or restructure course
  content.** (Note: it may still reference the old `python build.py` — run
  `pnpm build` + `pnpm verify` instead.)

## Lint & format (Ultracite + Biome)

The repo uses the **Ultracite** preset on top of **Biome 2.5.6**
(`biome.jsonc`, devDeps `ultracite` + `@biomejs/biome`).

- `pnpm check` — lint + format check (this is what CI runs).
- `pnpm fix` — auto-fix everything biome considers safe.
- ⚠️ **Never run `pnpm fix` (or `biome check --write`/`--apply`) while
  `assist.actions.source.organizeImports` is enabled for `.astro` files** —
  Biome cannot see component usage in `.astro` templates and **deletes
  frontmatter imports**. The config keeps `organizeImports` off for `*.astro`
  for this reason; re-enable it only if the upstream preset fixes the
  analysis.
- Scope: `content/`, `.claude/`, `.agents/`, `.vscode/`, `images/`, `public/`,
  `dist/`, `node_modules/`, `transcripts/`, `notes/`, `engine/`, `index.html`
  and `.github/` are excluded from linting — authored course content and
  legacy files are never reformatted.
- Some rules are intentionally relaxed in `biome.jsonc` (inline JSX handlers,
  PascalCase component filenames, conditional JSX with `&&`, `safe center`
  CSS fallbacks, lightbox a11y) with reasons documented in the config or as
  `biome-ignore` comments.

## What NOT to do

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


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm dlx ultracite fix` before committing to ensure compliance.
