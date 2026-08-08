---
version: alpha
name: The Algorithm
description: A dark, reading-first, chart-forward interface for an offline interactive trading course. Single self-contained HTML, zero dependencies, tokens defined in engine/head.html :root.
colors:
  bg: "#0b0e14"
  bg2: "#11151f"
  panel: "#161b28"
  panel2: "#1c2333"
  border: "#232b3d"
  text: "#d7dce6"
  muted: "#8a93a6"
  dim: "#5c6478"
  accent: "#4f8cff"
  accent2: "#7aa5ff"
  gold: "#e8b45a"
  green: "#43c78b"
  red: "#e2606c"
typography:
  font: "'Segoe UI', system-ui, -apple-system, sans-serif"
  hero: "42px/1.15, weight 700"
  lesson-title: "32px/1.2, weight 650"
  h3: "20px, weight 400"
  h4: "16px, weight 400"
  body: "16px/1.65"
  small: "12px–13.5px"
  caps-label: "11px, uppercase, letter-spacing 1.2–1.5px"
radius: 12px
breakpoint: 900px
---

# DESIGN.md — visual source of truth

This file is the canonical reference for how **The Algorithm** looks and feels.
Every value below is real: they come from `engine/head.html` (the `:root`
tokens and component CSS) — nothing here is aspirational. When you restyle,
change the source of truth first (`engine/head.html`), then rebuild. **Never
hand-edit `index.html`.**

## Overview

A dark, dense learning surface for trading content. The course is reading-first:
long-form lesson text, definition cards, charts, and quizzes. The design keeps
the chrome quiet (sidebar + fixed-width reading column) so the **charts and the
copy** carry the interface. Everything is a subtle variation on one panel
surface, differentiated by a colored left border or an accent.

## Surface roles

| Token | Role |
|-------|------|
| `--bg` `#0b0e14` | Page background — the dark "canvas" |
| `--bg2` `#11151f` | Sidebar, notes panels, explanation strips |
| `--panel` `#161b28` | Card/component surfaces (quizzes, callouts, cards) |
| `--panel2` `#1c2333` | Raised surfaces inside panels (options, buttons, progress track) |
| `--border` `#232b3d` | 1px borders on every surface |

Layering is strictly **depth by lightness**: bg → bg2 → panel → panel2. There
is almost no shadow — the interface separates by tone, not by elevation.

## Colors & semantic roles

| Token | Value | Use |
|-------|-------|-----|
| `--accent` `#4f8cff` | Interactive / active (active nav, buttons, focus, hover borders) |
| `--accent2` `#7aa5ff` | Section headings, h3, flip-card fronts |
| `--gold` `#e8b45a` | Emphasis: brand mark, month headings, h4, quiz titles, rule callouts, exam titles |
| `--green` `#43c78b` | Success: done dots, progress fill, pass scores, review cards |
| `--red` `#e2606c` | Warning/danger: warn callouts, video link accents, danger buttons, fail scores |
| `--text` `#d7dce6` | Primary body text |
| `--muted` `#8a93a6` | Secondary text (descriptions, captions, options idle) |
| `--dim` `#5c6478` | Tertiary text / disabled (counters, hints, timestamps) |

**Semantic feedback:** correct answers glow green, wrong answers glow red
(subtle 12% alpha fills, not solid). A quiz is a quiet panel; the correct/wrong
state is the only moment color shouts.

## Hard rules

- Dark theme only; no light mode. All tokens are tuned for contrast on `--bg`.
- One accent per surface: gold for emphasis, blue for interactive, green/red
  strictly for right/wrong and done states.
- No gradients except the progress bar (accent → green) and the lightbox
  scrim. No drop shadows except the mobile sidebar overlay.
- Do not add new colors to components — reuse the 13 tokens.
- `&` must be escaped as `&amp;` in lesson HTML.

## Typography

Single sans stack: `'Segoe UI', system-ui, -apple-system, sans-serif`.

| Element | Size / weight | Notes |
|---------|---------------|-------|
| Home hero h2 | 42px / 700 | `em` spans use gold for the word mark |
| Lesson title (h2) | 32px / 650 | inside `.lesson-hero` |
| h3 | 20px | blue (`--accent2`), generous top margin (34px) |
| h4 | 16px | gold; optional `<span class="src">(L4)</span>` lesson pointer in dim caps |
| Body | 16px / 1.65 | line length capped at 640–880px |
| Caps labels | 11px, uppercase, letter-spacing 1.2–1.5px | crumbs, tags, nav sections, month heads |
| Small text | 12–13.5px | captions, muted counts, quiz subtitles |

Type weight does the hierarchy work: bold body (`strong`) is pure white
`#fff` — the only place text goes brighter than `--text`.

## Layout & spacing

- **App shell:** flex row. `#sidebar` 320px, sticky, full-height scroll; `#main`
  takes the rest.
- **Reading column:** `.inner` max-width 880px, auto-centered, 32px side padding
  (18px under 900px).
- **Rhythm:** section blocks breathe with 34–44px top margins; cards group at
  14px gaps; callouts and figures sit at ~18px vertical margins.
- **Breakpoint 900px:** sidebar becomes an off-canvas drawer (`translateX(-100%)`
  → `.open`), a `#menu-toggle` button appears, hero drops to 25px, inner padding
  to 18px.

## Elevation & shapes

- Radius: 12px on surfaces (callouts, cards, quiz, panels), 8px on inner
  controls (options, buttons, notes area), 6px on the video icon chip.
- Separators: 1px `--border`. Cards lift on hover with a 2px `translateY(-2px)`
  and a border-color change — never shadow.
- The only full-screen overlay is the lightbox: `rgba(5,7,12,.94)` scrim.

## Components

| Component | Signature |
|-----------|-----------|
| Sidebar brand | 17px title, gold `span`, 12px muted sub, sticky header |
| Nav items | 13.5px muted; `.active` = panel bg + 3px accent left border |
| Nav dots | 16px circles; done = green fill with dark check |
| Progress bar | 6px track; accent→green gradient fill, 0.4s width transition |
| `.lesson-hero` | 44px top pad, bottom border; crumb = gold caps |
| `.lesson-video` | Panel chip with red ▶ icon square; border turns red on hover |
| `.callout` | Panel + 3px left border: accent (info), gold (`.rule`), red (`.warn`); caps tag |
| `.kv` | Definition grid, 150px label column, gold labels on panel stripes |
| `.flip` cards | 150px 3D flip (rotateY 0.5s); front = panel2/accent2, back = panel/accent border |
| `.fig` | Full-width image, 12px radius, border; hover scale 1.005 |
| `.gallery` | Auto-fill grid (min 240px), 160px thumbnails, top-left object-fit |
| Lightbox | Pinned stage (flex:1, min-height:0) + caption + control panel; zoom 100–500%, drag pan |
| `.quiz` | Panel, gold title, 4 stacked options; correct green / wrong red + explanation strip |
| `.exam` | Like quiz + picked (blue) state, missed (red) question text, sticky score bar, 80% pass |
| `.btn` | Panel2 pill; `.primary` = accent fill; `.done-btn.marked` = green fill |
| `.save-btn` | Accent-outlined action (accent border, soft accent-tinted fill, accent2 text); neutral + muted when disabled |
| `.notes` | Panel with textarea; border turns accent on focus |
| `.mcard` / `.rcard` | Home cards, 20px pad, colored left border (gold months / green reviews), hover lift |

## Motion & interaction

- Lesson reveal: `fadeIn` 0.35s (opacity + 8px rise).
- Hovers: 0.15s transitions on borders/backgrounds; cards lift 2px.
- Flip cards: 0.5s `rotateY` with `preserve-3d`.
- Progress: 0.4s width transition.
- Zoomed lightbox image: `cursor: grab` → `grabbing` while panning.
- No page-level animations; no parallax; no marquees.

## Iconography & graphics

- Single inline SVG favicon (gold chevron + blue bar on dark rounded square).
- UI icons are text/Unicode glyphs (▶ play, zoom `+`/`−`, `×`) — no icon
  library, no external requests.
- Charts are screenshots from ICT's mentorship notes, stored as
  `images/{slug}-NN.png`, rendered with captions like "Note chart N of M".

## Accessibility & performance

- Native buttons/links everywhere; focus visible via hover-equivalent border
  changes.
- All images carry `alt` text; every interactive control has text or an `aria`-
  free label from surrounding text.
- Lazy-loaded images (`loading="lazy"`); broken images auto-remove their figure.
- The built file is one HTML document with zero external requests — load is
  instant offline.
- Color is never the only signal: correct/wrong also change border and add
  explanation text.

## Do's and don'ts

- ✅ Reuse the styled components (`.callout`, `.kv`, `.flip-row`, `.quiz`,
  `.fig`) — don't reinvent.
- ✅ Keep copy in the user's own words, traceable to the source material.
- ✅ Use `--dim` for anything non-essential.
- ❌ Don't introduce new hex values, fonts, shadows, or light-mode variants.
- ❌ Don't stretch the reading column beyond 880px.
- ❌ Don't add external assets — the offline single-file property is sacred.
- ❌ Don't animate layout (no height/width transitions that shift content).

## Implementation guide

1. Design tokens live in `engine/head.html` `:root` — change them there, then
   `python build.py`.
2. Component CSS follows in the same file, grouped: layout → sidebar → lesson
   header → content blocks → images → lightbox → quiz/exam → review/home →
   reset/notes → footer → mobile `@media(max-width:900px)`.
3. Content components are used directly in `content/…/lesson.html`; the engine
   fills `.fig-slot`, `.quiz`, `.lesson-footer` at runtime from `app.js`.
4. Rebuild + verify: `python verify.py` (headless Chromium checks every page,
   image, quiz, and interaction; CI enforces the same).

## Agent prompt guide

When asked to change the look: read `engine/head.html` first, identify which
token or component block owns the surface, edit there, rebuild with
`python build.py`, and verify with `python verify.py`. Never edit
`index.html`. Never change the `:root` token set without updating every
consumer.

## Iteration guide

- Prefer token changes over component rewrites — one value, many surfaces.
- When a component drifts from this document, fix the CSS in
  `engine/head.html` (source of truth), not the doc.
- Keep the 900px breakpoint behavior in mind for any new surface (sidebar
  drawer, condensed panels).

## Known gaps

- No light mode (by design — the charts are dark).
- Reduced-motion media query not yet implemented; motion is minimal.
- Focus styles rely on border changes; a dedicated `:focus-visible` outline
  could be added for keyboard-only users.
