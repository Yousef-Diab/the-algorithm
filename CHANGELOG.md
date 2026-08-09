# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/): human sentences under
`Added` / `Changed` / `Fixed` / `Documentation` / `Verification` headings,
grouped by version and date. This file is maintained as part of every task —
agents update the `Unreleased` section before reporting work as done.

## Unreleased

### Added
- Added a Contributors section to the README with GitHub avatar links for each
  contributor.
- Contributor names in the site footer are now clickable links to their GitHub
  profiles, styled to match the surrounding text color.

### Changed
- Replaced the custom-built Lightbox.tsx (318 lines React island + ~130 lines CSS)
  with `yet-another-react-lightbox` v3.32.2 (Zoom + Captions + Download + Share
  + Slideshow + Fullscreen plugins). All existing behavior is preserved: click
  interception on `.fig img`, lesson-scoped gallery browsing, zoom (max 5×), and
  close-on-backdrop-click. The new library adds touch gestures (pinch-to-zoom,
  swipe), smooth slide transitions, a loading indicator, preloading of adjacent
  images, a download button (saves the chart PNG to disk), a share button (uses
  the Web Share API where available), a slideshow button (auto-advances through
  the lesson's charts every 3 s), and a fullscreen button (uses the Fullscreen
  API for an immersive view) — all previously unavailable in the custom
  implementation. The old `.lb-*` CSS and `#lightbox` styles were removed from
  `global.css`; the lightbox UI colors are now fixed light values
  (`hsla(0,0%,100%,.8)` for buttons, `#7aa5ff` for caption titles, `#d7dce6` for
  descriptions) rather than theme variables, so the toolbar and captions stay
  visible on the always-dark backdrop in both light and dark site themes.
  Verification was updated to match the library's DOM selectors
  (`.yarl__portal_open`, `.yarl__no_scroll`, `.yarl__navigation_prev/next`).
- All internal imports now use `@/` path aliases (`@/components/…`,
  `@/layouts/…`, `@/lib/…`, `@/stores/…`) instead of deep relative paths
  (`../../../../`). `tsconfig.json` was extended with explicit path mappings
  (`@components/*`, `@layouts/*`, `@lib/*`, `@stores/*`, `@styles/*`) and
  `baseUrl` following the standard Astro + TypeScript path-alias pattern so
  module resolution works reliably across the entire `src/` tree. Every `.astro`
  and `.tsx` file under `src/` now uses `@/`-prefixed imports — zero relative
  imports remain.

### Added
- New site footer shown on every page (landing and all course pages) with the
  course credits — "Made with ♥ by Yousef Diab and Ritspun" — plus a GitHub
  link to the repository for collaboration, an "About this course" note, a
  quick "Back to the course" link and a small copyright line; the footer
  stacks into a single column on small screens.
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

- Multi-job CI pipeline (`.github/workflows/ci.yml`) with parallel linting,
  type checking and build verification, a quality gate that aggregates all job
  results and fails if any dependency was cancelled, skipped or failed, and
  concurrency groups that cancel redundant runs on rapid pushes.
- Security workflow (`.github/workflows/security.yml`) that audits dependencies
  on every push to `main`, every pull request targeting `main`, and every Monday
  at 06:24 UTC — plus on-demand via `workflow_dispatch` — with its own security
  gate that enforces a clean audit result.
- Dependabot configuration (`.github/dependabot.yml`) for automated weekly
  updates: npm dependencies grouped into a single PR every Monday at 07:00 UTC,
  and GitHub Actions every Monday at 07:30 UTC, both capped at 5 open PRs.
- Type checking step in CI (`pnpm typecheck` via `@astrojs/check`) that runs
  `astro check` in parallel with the lint job, catching type errors before the
  build starts.
- `.node-version` file at the repo root pinning Node.js to version 24, so
  `fnm`, `nvm`, `nodenv` and GitHub Actions `setup-node` auto-select the correct
  version.
- All three workflows now declare explicit `permissions` (least privilege:
  `contents: read` for CI and security; `pages: write` + `id-token: write` for
  deploy), `timeout-minutes` on every job to prevent hung runners, and a shared
  `NODE_VERSION` env variable at the workflow level.

### Changed
- `astro.config.mjs` is now env-driven: `site` and `base` default to the GitHub
  Pages target (`https://yousef-diab.github.io` + `/the-algorithm`) but can be
  overridden at build time with `SITE_URL` and `BASE_PATH` (e.g. `BASE_PATH=/`
  for root-level hosts like Coolify).
- `astro.config.mjs` now sets `output: "static"` explicitly, documenting that
  the site is a pure prerendered build (no adapter, no SSR) — matching Astro's
  default.
- `deploy.yml` now passes an optional GitHub repo variable `SITE_URL` to the
  build (Settings → Secrets and variables → Actions → Variables); unset on the
  upstream repo it expands to an empty string, and `astro.config.mjs` treats an
  empty `SITE_URL` as "use the GitHub Pages default" — so a fork can override
  the canonical URL for testing without hardcoding the fork domain in the
  repo.
- `verify.mjs` now derives its base path from `BASE_PATH` (defaulting to
  `/the-algorithm`), so `pnpm verify` matches whichever base the site was built
  with.
- Site footer and README badges now point at the upstream repository
  (`Yousef-Diab/the-algorithm`) instead of the fork.
- Agent skills reorganized: the Python-era skills (`async-python-patterns`,
  `dbos-python`, `pydantic-ai`, `pydantic-models-py`,
  `python-development-python-scaffold`, `python-fastapi-development`,
  `python-packaging`, `python-patterns`, `python-performance-optimization`,
  `python-pro`, `python-testing-patterns`) were removed from `.agents/skills/`,
  and the remaining skill library now lives in both `.agents/skills/` and
  `.claude/skills/` (byte-identical mirrors) so agent runtimes reading either
  location get the same set; the `add-content` skill is now also present under
  `.agents/skills/`.
- Personal notes no longer auto-save while typing. A "Save notes" button now
  saves them on demand, and a brief "✓ Saved" confirmation appears next to it
  and fades out on its own; until you save, a subtle "Unsaved changes" hint
  shows so it is clear your typing is not written to `localStorage` yet.
- The "Save notes" button is styled as an accent-outlined action (accent
  border, soft accent-tinted fill and accent-coloured label) so it stands out
  from the page background and reads as useful at a glance; when there is
  nothing to save it falls back to a neutral, muted look that clearly signals
  it is not yet needed.
- A "Clear" button next to "Save notes" wipes the notes textarea and saves the
  cleared state in the same click, so the lesson notes come back empty without
  having to clear and re-save manually; a brief "✓ Cleared" confirmation
  appears and fades out on its own, and the button is disabled while the
  textarea is already empty. It stays neutral until hovered, when it turns a
  soft red to hint it removes content.
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
- CI pipeline (`.github/workflows/ci.yml`) restructured from a single
  monolithic job into independent parallel jobs (lint, typecheck,
  build‑verify) with a quality gate that aggregates results and fails the
  run if any dependency failed, was cancelled, or skipped. The build job
  uploads the `dist/` artifact for post‑mortem inspection when verification
  fails.
- Deploy workflow (`.github/workflows/deploy.yml`) now includes explicit
  `timeout-minutes` on every job, descriptive job names (`Build` / `Deploy`)
  and a shared `NODE_VERSION` env variable.
- Mirrored the full content audit from `origin/main` (22 commits of fixes made
  on the old single-file structure) into the Astro `content/` tree — 6
  blocking errors fixed (Tier 1), 16 one-line corrections (Tier 2), 28 new
  quiz questions and 91 rebuilt option sets (Tiers 3–4), 31 fidelity /
  hedging / option-length findings (Tier 5), a prose skim, and the M14/K11/N16
  follow-up fixes. Applied cleanly with zero merge conflicts because the Astro
  branch had not modified `content/`; the two final exams and their summaries
  are now consistent again (Section 1: 45 questions; Section 2: 43).
- `docs/content-audit.md` (the audit log behind those fixes) is now in the
  repo, and the legacy `engine/`, `index.html` and `verify.py` files were
  mirrored in as historical reference (still not used by the Astro build).

### Fixed
- `pnpm-workspace.yaml` declared no `packages`, so pnpm 9.x (the version
  Nixpacks installs on Coolify) failed with "packages field missing or empty".
  The root is now declared as the only workspace package (`packages: ["."]`).
- The `packageManager` pin (`pnpm@11.20.0`) made Nixpacks install `corepack`
  and run pnpm through it, which crashes on Node 24 with
  `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING` (corepack 0.24.1 cannot load pnpm
  11's ESM wrapper). The pin is removed so Nixpacks uses its own pnpm 9.x, and
  `package.json` now declares `engines.node >= 22.12.0` (Astro 7's requirement —
  Nixpacks was selecting Node 22.11.0, which would have failed the build).
- The esbuild build-script approval stays in `pnpm-workspace.yaml` as
  `allowBuilds: esbuild: true` (pnpm 11's syntax — pnpm 10/11 block build
  scripts unless approved). Older pnpm 9.x used by Nixpacks runs build scripts
  by default, so it needs no extra config there. (An attempt to move the
  approval to `pnpm.onlyBuiltDependencies` in `package.json` was reverted:
  pnpm 11 ignores that field when `pnpm-workspace.yaml` exists.)
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
- Citation spans (`.src`) inside the summaries' tag chips and key/value rows
  rendered unstyled because the Astro stylesheet had no `.src` rule — ported
  the legacy `.lesson .src` rule (the `engine/head.html` fix that widened
  `.lesson h4 .src` to `.lesson .src`) into `global.css`.
- Lightbox toolbar overflowed on narrow phones (≤380px): the 7 plugin buttons
  (Fullscreen, Slideshow, Share, Download, Zoom in, Zoom out, Close) at the
  default 48px each (32px icon + 8px×2 padding) totalled 352px + 16px toolbar
  padding, so the leftmost button was clipped off-screen at 320px viewport
  width. A `@media (max-width: 380px)` rule now shrinks the buttons to 36px
  (28px icon + 4px×2 padding → 268px total), so all 7 buttons fit within
  320px and even 280px (Galaxy Fold folded) with room to spare.

### Documentation
- `README.md` deploy section now documents both hosts: GitHub Pages via
  `withastro/action@v6` with the defaults, and Coolify as a plain static build
  (`BASE_PATH=/` env var, `dist/` as the output — no Dockerfile needed) —
  including a table of the `SITE_URL` / `BASE_PATH` overrides.
- `README.md` rewritten from scratch: dropped the outdated single-file Python
  build description and now documents the current Astro 7 stack — features,
  tech stack, quick start (pnpm dev/build/preview/verify/check), project
  structure, course content, content model, verification & CI/CD, roadmap,
  credits and disclaimer — in the standard top-repository README format.
- `AGENTS.md` rewritten for the Astro stack (commands, architecture, authoring
  conventions unchanged).
- `CLAUDE.md` updated to match the current Astro stack and merged with
  `AGENTS.md`: both agent guides now share the golden rules (content purity,
  build-artifact discipline, changelog, protect main, task planning), the Astro
  architecture and project structure, content-authoring conventions, the common
  tasks table, lightbox implementation notes, source material & tooling, the
  development workflow, lint & format rules and the Ultracite code standards.
  The pre-Astro Python-era content of `CLAUDE.md` (old `build.py`/`engine`/
  `verify.py` architecture, SPA verification quirks and future direction) is
  preserved in a clearly-marked legacy reference section.
- `AGENTS.md` gained the pieces it was missing from `CLAUDE.md`: the common
  tasks table, chart-lightbox implementation notes, a source material &
  tooling section, and the `ict-sidebar-collapsed` /
  `ict-sidebar-scroll` storage keys in the State section; the development
  workflow now lists `pnpm check` and clarifies that `pnpm verify` runs against
  the existing `dist/` after `pnpm build`. It also gained the full
  "Legacy reference" appendix (pre-Astro `engine/`/`build.py` architecture,
  SPA-era verification quirks and future direction).
- `CLAUDE.md` gained the pieces it was missing from `AGENTS.md`: a dedicated
  "The data model" section (sections/months/quiz/exam/video/image bullets) and
  the "Development workflow" command block (`pnpm dev`/`build`/`verify`/
  `check`/`preview`) at the top of the Verification section. Both files now
  carry the same information.
- `AGENTS.md` and `CLAUDE.md` now mirror each other exactly: the same content,
  section order and numbering (§1–§12), with only the file-specific identity
  differing — each guide's H1 title and its §12 self-reference name their own
  file (`AGENTS.md` vs `CLAUDE.md`).
- `AGENTS.md` and `CLAUDE.md` §6 gained the "Section 1 notes" bullet (Notion
  page-ID map + fetch recipe) and the "Both sources count" bullet, and §8
  gained the summary-vs-exam question-count verification bullet — ported from
  the three semantic additions `main` made to `CLAUDE.md`.

### Verification
- `pnpm check`, `pnpm build` (85 pages) and `pnpm verify` all pass after the
  env-driven deployment config: `site` + `base` now read `SITE_URL` /
  `BASE_PATH`, and `verify.mjs` derives its base from `BASE_PATH`. Verified in
  both modes — default GitHub Pages (`/the-algorithm`) and root-level
  (`BASE_PATH=/`, the Coolify case): 84 routes, 78 lessons, lightbox, exams,
  review pages, theme switcher, zero page/console errors in each.
- `pnpm check`, `pnpm build` (85 pages) and `pnpm verify` all pass after the
  notes save-button and responsive footer work: 84 routes, 78 lessons
  (titles, charts, quiz grade/reset, video links, notes box + save/clear buttons),
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
- `verify.mjs` gained the summary-vs-exam count check (ported from
  `verify.py`): a section summary's prose-stated exam question count must match
  the exam that actually renders — a summary may state no count, but may not
  state a wrong one. `pnpm build` (85 pages) and `pnpm verify` all pass after
  the content mirror: 84 routes, 78 lessons, lightbox, both final exams (45/43
  questions), summary counts, review pages, theme switcher, and zero
  page/console errors.

### Verification
- `pnpm check`, `pnpm build` (85 pages) and `pnpm verify` all pass after the
  CI/CD workflow overhaul: 84 routes, 78 lessons (titles, charts, quiz
  grade/reset, video links, notes), lightbox open/browse/zoom/close, both
  final exams (submit, 80% pass, retake), theme switcher persistence, and zero
  page/console errors.

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
