---
title: Other Components
description: Header, ThemeToggle, LessonFooter, Figure, SiteFooter and the layouts — their contracts and edge cases.
---

The remaining components are smaller, but each has a contract worth knowing.

## Header (`Header.astro`)

The topbar: brand + theme switcher.

- Brand mark: the gold `A` on a navy rounded square (`.b-mark`), next to the
  wordmark **"The Algorithm"** (title text: `The <span>Algorithm</span>`).
- Brand colors: gold `#e8b45a` on dark navy `#161b28` — the same brand mark
  used in the favicon and the docs site logo.
- Mounts `ThemeToggle` (the only `client:load` island — it must work
  immediately to avoid a theme flash).

## ThemeToggle (`ThemeToggle.tsx`)

Light / dark / system switcher.

- Persists the choice in `ict-theme` (`light` | `dark` | `system`).
- Applied via the `html[data-theme]` attribute, which drives:
  - the DaisyUI themes (`trading` / `trading-light`),
  - the docs site's Mermaid diagrams (`autoTheme` switches default/dark).

## LessonFooter (`LessonFooter.tsx`)

The prev / mark complete / next row at the bottom of each lesson.

- Hydrated with `client:idle`.
- "Mark complete" toggles the lesson id in `doneStore` (persisted to
  `ict-done`).
- Prev/next links navigate through the section's lessons in order (from
  `getGraph()`).
- Review/exam pages use `.review-footer` instead and are excluded from the
  lesson chain.

## Figure (`Figure.astro`)

Server-side chart figures.

- Renders the lesson's figures from `images/{slug}-NN.png` (counts
  auto-derived).
- Zero JavaScript — the lightbox interactivity is added by the `Lightbox`
  island at the page level.
- Missing images auto-remove the figure at runtime.

## SiteFooter (`SiteFooter.astro`)

The static site footer. Plain HTML — no interactivity.

## Layouts

### BaseLayout (`src/layouts/BaseLayout.astro`)

The HTML shell: head, meta tags, global styles, theme bootstrap and the
**favicon** — the inline brand mark (gold `A` on navy). Every page uses it.

### CourseLayout (`src/layouts/CourseLayout.astro`)

The course chrome: `Header`, `Sidebar`, the `Lightbox` island, and the main
content area. Lesson, review and exam pages render inside it.

## Edge cases worth remembering

- **Theme flash**: `ThemeToggle` is `client:load` for a reason — it applies
  the saved theme as early as possible.
- **Brand consistency**: when restyling, keep the `#e8b45a` / `#161b28`
  tokens (they're defined in `global.css` as `--color-accent`/`--gold` and
  `--color-base-300`/`--panel`).
- **The footer slot contract**: lessons get `.lesson-footer`; review pages get
  `.review-footer`. Don't swap them.
