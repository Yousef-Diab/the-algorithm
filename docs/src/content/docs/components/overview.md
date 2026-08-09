---
title: Components Overview
description: The component inventory — .astro components vs React islands, hydration directives, and where each one lives.
---

The UI is built from two kinds of components:

- **`.astro` components** — render on the server, ship zero JavaScript unless
  they mount an island.
- **React islands (`.tsx`)** — interactive components hydrated on the client
  with a `client:` directive.

## Inventory

| Component | File | Kind | Hydration |
| --- | --- | --- | --- |
| `Header` | `src/components/Header.astro` | Astro | — (static, with island) |
| `ThemeToggle` | `src/components/ThemeToggle.tsx` | React | `client:load` |
| `Sidebar` | `src/components/Sidebar.tsx` | React | `client:idle` |
| `Quiz` | `src/components/Quiz.tsx` | React | `client:visible` |
| `Exam` | `src/components/Exam.tsx` | React | `client:visible` |
| `Notes` | `src/components/Notes.tsx` | React | `client:idle` |
| `LessonFooter` | `src/components/LessonFooter.tsx` | React | `client:idle` |
| `ResetPanel` | `src/components/ResetPanel.tsx` | React | `client:visible` |
| `CourseProgress` | `src/components/CourseProgress.tsx` | React | `client:idle` |
| `Lightbox` | `src/components/Lightbox.tsx` | React | `client:idle` |
| `Figure` | `src/components/Figure.astro` | Astro | — (server-side) |
| `SiteFooter` | `src/components/SiteFooter.astro` | Astro | — (static) |

Plus the layouts:

- `src/layouts/BaseLayout.astro` — head, theme, favicon.
- `src/layouts/CourseLayout.astro` — header, sidebar, lightbox, main area.

## Hydration directives

| Directive | Hydrates… | Used by |
| --- | --- | --- |
| `client:load` | Immediately on page load | `ThemeToggle` |
| `client:idle` | When the browser is idle | `Sidebar`, `Notes`, `LessonFooter`, `CourseProgress`, `Lightbox` |
| `client:visible` | When scrolled into view | `Quiz`, `Exam`, `ResetPanel` |

**Rule of thumb:** hydrate as late as possible. Lesson quizzes sit below the
fold on long pages, so `client:visible` saves real work.

## Server vs client

- **Server components** (`Figure`, `Header`, `SiteFooter`, layouts, pages)
  build the HTML once at build time.
- **Client islands** get their initial HTML from the server render and then
  become interactive when hydrated.

This is why a page still works (mostly) without JavaScript — the islands
degrade to their server-rendered HTML.

## Shared libraries

- `src/lib/course.ts` — types + the `u()` base-URL helper (always use it for
  internal links).
- `src/lib/graph.ts` — `getGraph()`, the nested sections→months→lessons
  structure for navigation and progress.
- `src/stores/progress.ts` — the nanostores; see
  [Client State](/architecture/client-state).

## Styling

All styling lives in `src/styles/global.css` (Tailwind 4 + DaisyUI 5 themes +
component CSS). Reuse the styled components; **don't invent new CSS** — if a
component needs a visual change, edit the stylesheet. See
[Lint & Format](/development/lint-format) before touching `.tsx` files
(Biome/Ultracite rules apply to `src/`).

## Editing components

Component changes are rarer than content changes. When you do touch them:

1. Make the change in the component file.
2. `pnpm build` && `pnpm verify` (verify exercises the interactive behavior).
3. Update `CHANGELOG.md` (`### Changed`).
4. Update this docs section if the component's contract changed.

The rest of this section documents each interactive component's contract:
[Quiz](/components/quiz), [Exam](/components/exam),
[Lightbox](/components/lightbox), [Sidebar & Progress](/components/sidebar),
[Other Components](/components/other).
