# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/): human sentences under
`Added` / `Changed` / `Fixed` / `Documentation` / `Verification` headings,
grouped by version and date. This file is maintained as part of every task —
agents update the `Unreleased` section before reporting work as done.

## Unreleased

### Added
- Sidebar sections now open and close with a smooth slide + fade animation
  (the lesson list expands/collapses via animated grid rows with an opacity
  crossfade), and the desktop full collapse fades the sidebar out/in instead
  of snapping shut; the mobile drawer also fades its shadow in while sliding.
- The mobile drawer now closes when tapping outside of it, so readers no
  longer need to hit the toggle button or press Escape.
- Sidebar months are now collapsible: each month header is a button with a
  chevron that expands or collapses its lesson list, and all months are closed
  by default except the one the user is currently working in.
- Months auto-collapse when completed: as soon as the last lesson of an open
  month is marked done, the month closes itself and the next incomplete month
  in the same section opens in its place (or the review group, when the
  section ends there), keeping the sidebar focused on what comes next.
- Full sidebar collapse on desktop: the "Lessons" button in the topbar now
  hides the entire sidebar so readers can focus on the content, and the choice
  is remembered in `localStorage` (`ict-sidebar-collapsed`) across page
  navigations; on mobile the same button keeps its drawer behaviour.
- Sidebar scroll position is persisted across page navigations: the course
  sidebar now restores the exact scroll position the user left it at, so the
  active lesson stays in view instead of resetting to the top on every link
  click (saved per tab in `sessionStorage`, with a fallback that scrolls the
  active item into view on first visit or direct URL entry).
- Agent-facing docs at the repo root: `AGENTS.md` (working rules and project
  architecture for AI agents), `DESIGN.md` (visual source of truth), and this
  `CHANGELOG.md` — adapted to this project, based on the existing `CLAUDE.md`.
- Full migration to **Astro 7** with **Tailwind CSS 4** and **DaisyUI 5** —
  multi-page static build with real URLs per lesson (hash routing replaced).
- Landing page explaining the course and its purpose, with a prominent
  "Start the course" button that leads into the course.
- Header theme switcher (light / dark / system) with an anti-FOUC inline
  script and `localStorage` persistence (`ict-theme`).
- Custom DaisyUI themes `trading` (dark, default) and `trading-light` mapping
  the existing design tokens.
- React islands for the interactive parts: quiz, final exam, lightbox,
  per-lesson notes, sidebar navigation, theme toggle, course progress and
  reset panel.
- Accessibility improvements: skip link, `:focus-visible` styles,
  `prefers-reduced-motion` support and keyboard-operable flip cards.
- GitHub Pages deploy workflow (`.github/workflows/deploy.yml` via
  `withastro/action@v6`).
- **Ultracite** preset with **Biome 2.5.6** (`ultracite` + `@biomejs/biome`
  devDependencies) — `pnpm check` / `pnpm fix` scripts, `biome.jsonc` with
  scope exclusions for authored content (`content/`, `.claude/`, legacy
  files) and overrides for `.astro` (organizeImports, unused-imports,
  non-null-assertion rules off).

### Changed
- Personal notes no longer auto-save while typing. A "Save notes" button now
  saves them on demand, and a brief "✓ Saved" confirmation appears next to it
  and fades out on its own; until you save, a subtle "Unsaved changes" hint
  shows so it is clear your typing is not written to `localStorage` yet.
- The "Save notes" button is styled as an accent-outlined action (accent
  border, soft accent-tinted fill and accent-coloured label) so it stands out
  from the page background and reads as useful at a glance; when there is
  nothing to save it falls back to a neutral, muted look that clearly signals
  it is not yet needed.
- The lesson footer buttons (previous / mark complete / next) now stack into
  full-width rows on narrow screens (≤640px) instead of wrapping and
  colliding, so long lesson titles can never overlap on mobile; they also get
  extra padding (12px vertical / 24px horizontal) on small screens and are
  allowed to grow past DaisyUI's fixed 2.5rem height, so wrapped two-line
  labels never sit flush against the button edges or overflow the button.
- The mobile drawer no longer casts the large soft box-shadow glow around its
  edges. Instead, when the drawer opens, the page content behind it is dimmed
  and slightly blurred by a dark scrim (`drawer-scrim`) that spans from just
  below the topbar down to the bottom of the screen, so the topbar and the
  sidebar keep their normal colours and the content clearly recedes into the
  background; tapping the scrim closes the drawer as well.
- The "The Algorithm" brand in the topbar is now centered on mobile instead
  of sitting at the left edge, while the menu and theme buttons stay at the
  edges; on very small screens (≤480px) the "Lessons" label collapses to the
  icon, the theme button collapses to its icon too, and the brand shrinks
  slightly so nothing overlaps.
- Month headers in the sidebar went from static headings to accessible
  `<button>` elements with `aria-expanded`, a focus outline and an animated
  chevron that rotates when the month is open; the review group uses the same
  pattern for its "Section Summary" and "Final Exam" links.
- The topbar "Lessons" button is now visible on desktop (not only on mobile)
  and its `aria-label` was updated to "Show or hide the lesson list"; the
  desktop collapse state is re-applied before paint on every navigation so the
  sidebar never flashes open between pages.
- Navigation between pages now uses smooth client-side view transitions
  (Astro `ClientRouter`): links crossfade instead of hard-reloading, matching
  the old full-reload behaviour of starting forward navigations at the top of
  the page while back/forward history keeps its restored position.
- Sidebar scroll persistence now works with view transitions: the saved
  position is re-applied before the new page paints on every navigation, and
  the flip-card keyboard attributes are re-applied after each transition.
- Build system rewritten from the Python `build.py` single-file assembler to
  `pnpm build` (Astro content collections with custom loaders walking
  `content/`).
- Single-file `index.html` replaced by a multi-page static site in `dist/`
  (gitignored; never hand-edit).
- Sidebar navigation became a shared layout component (`CourseLayout`).
- Verification rewritten from `verify.py` to `verify.mjs` (Node + Playwright
  against the built `dist/`).
- CI pipeline (`.github/workflows/ci.yml`) replaced with a pnpm-based
  install → build → verify workflow.

### Fixed
- Theme switcher could transiently flip the page to the OS theme right after
  load: the toggle's mount effect applied the initial `system` state before
  the saved preference, so on reload the page could flash the wrong theme
  (and briefly overwrite the saved value) when the OS scheme differed.
  The saved preference is now applied before the theme effect runs.
- Lesson bodies with figure slots lost their HTML in the built site — the
  fig-slot token regex was built from a template literal whose `\b`/`\s`
  escapes were consumed by the JavaScript string layer; now escaped
  correctly.
- React 418 hydration mismatches caused by `Math.random` shuffling in
  `useState` initializers — shuffles now happen in a post-mount effect.
- Lightbox zoom arithmetic corrected to be multiplicative (1.25× steps) with
  proper disabled states and fit-to-width measurement.
- Sidebar lesson links lost all formatting when selected — the `active`/`done`
  classes were concatenated to the base class without a space (e.g.
  `nav-lessonactive`), so neither `.nav-lesson` nor `.nav-lesson.active`
  matched and the item rendered as a bare inline link; class names now join
  with spaces, matching the original app's behavior.
- Sidebar `aria-expanded` and the `collapsed`/`open` classes could stay stale
  when resizing across the 900px breakpoint: the desktop check was evaluated
  only at render/event time, so the state was not re-synced after a viewport
  change (e.g. the topbar button kept `aria-expanded="true"` in a closed
  mobile drawer). The breakpoint is now observed reactively via
  `useSyncExternalStore`, and a leftover mobile drawer is cleared when the
  viewport grows back to desktop.
- On very narrow phones (≤480px) the centered brand could overlap the theme
  button: the toggle's "System" label pushed it into the logo's right edge.
  The theme button now collapses to its icon on small screens (same pattern as
  the "Lessons" label), keeping the brand centered with room to spare.

### Documentation
- `AGENTS.md` rewritten for the Astro stack (commands, architecture, authoring
  conventions unchanged).

### Verification
- `pnpm check`, `pnpm build` (85 pages) and `pnpm verify` all pass after the
  notes save-button and responsive footer work: 84 routes, 78 lessons
  (titles, charts, quiz grade/reset, video links, notes box + save button),
  lightbox open/browse/zoom/close, both final exams (submit, 80% pass,
  retake), theme switcher persistence, and zero page/console errors.
- `pnpm check`, `pnpm build` (85 pages) and `pnpm verify` all pass after the
  drawer-scrim work (glow removed, backdrop dims and blurs the content behind
  the open mobile drawer, scrim click closes it): 84 routes, 78 lessons
  (titles, charts, quiz grade/reset, video links, notes), lightbox
  open/browse/zoom/close, both final exams (submit, 80% pass, retake), theme
  switcher persistence, and zero page/console errors.
- `pnpm check`, `pnpm build` (85 pages) and `pnpm verify` all pass after the
  sidebar animation, tap-outside-to-close and centered-mobile-brand work: 84
  routes, 78 lessons (titles, charts, quiz grade/reset, video links, notes),
  lightbox open/browse/zoom/close, both final exams (submit, 80% pass,
  retake), theme switcher persistence, and zero page/console errors.
- (Previous round, collapsible sidebar + breakpoint sync) `pnpm check`,
  `pnpm build` (85 pages) and `pnpm verify` all pass: 84 routes, 78 lessons
  (titles, charts, quiz grade/reset, video links, notes), lightbox
  open/browse/zoom/close, both final exams (submit, 80% pass, retake), theme
  switcher persistence, and zero page/console errors.

## 1.0.0 — 2026-08-07

### Added
- **Section 2 — ICT 2022 Mentorship** is complete and live: 40 lessons (one per
  episode; episode 28 omitted — no audio), split across Parts 1–6, each lesson
  with its own quiz and source video link.
- Section 2 revision page (`summary.html`) and 40-question final exam
  (`exam.js`), with the exam page generated by `build.py` from `section.js`.
- Sections are first-class in the engine: `SECTIONS` drives the sidebar
  grouping, the home cards (grouped per section, numbered within it, taking
  their noun from the section's `label`), and the review/exam pages.
- Final-exam behavior: grades only on **Submit**, 80% pass mark, best score
  remembered, retake allowed. Picks are stored by option text so re-shuffling
  never breaks saved results.
- Per-lesson personal notes (`ict-notes`) with autosave, plus reset controls on
  the home page and in each quiz header that never touch notes.
- Chart galleries with a lightbox: whole-lesson set browsing (prev/next),
  zoom from 100% (fit) to 500% with drag-to-pan, and click-outside-to-close.
- `verify.py` — headless Chromium (Playwright) verification of every lesson,
  chart, quiz, lightbox interaction, video link, review/exam page, and a zero
  console-error check.
- CI workflow (`.github/workflows/ci.yml`) that builds on every PR, fails if
  the committed `index.html` is out of sync with `content/`, then runs the
  full `verify.py` suite.

### Changed
- Refactored from a single hand-built page to **content + engine + build step**:
  source now lives in `content/<section>/<month>/<lesson>/` and `engine/`;
  `index.html` is a build artifact produced by `build.py` and no longer edited
  by hand.
- Image counts are auto-derived from the `images/` folder — no image-count
  table to maintain; missing images auto-remove their figure at runtime.
- Quiz options are Fisher-Yates shuffled at render time, so the correct answer
  is never in a fixed on-screen position.
- Home cards and sidebar now render all sections dynamically; a month with no
  lessons yet renders inert instead of throwing on click.

### Fixed
- Quiz/exam array literals and `section.js`/`months.js` object literals are
  formatter-proofed in `build.py` (`parse_objs` / `js_literal`), so a
  formatter's `;` can no longer break the single shared `<script>` block.

### Documentation
- `CLAUDE.md` written as the working guide for AI-assisted development:
  content-purity rule, architecture, conventions, task mapping, and the
  verification loop.
- `docs/s2-2022-mentorship-plan.md` and `docs/s2-2022-mentorship-videos.md`
  document the Section 2 build plan, episode→lesson map, batching, and progress
  tracking.

### Verification
- `verify.py` exit codes are CI-friendly: 0 with a count summary on success,
  non-zero listing problems on any failure.
