---
title: Overview
description: What The Algorithm is, the tech stack it is built with, and the properties that every change must preserve.
---

**The Algorithm** is an interactive course built from ICT's (Inner Circle
Trader) Mentorships. It is a **static multi-page Astro site** with **React
islands** for interactivity, and it is fully **offline-capable** once built.

This page explains what the platform is, what it is built with, and the core
properties that every change must preserve.

## What the platform is

The course content lives in plain folders and files under `content/` — one
folder per lesson, with an HTML file for the lesson body, a JavaScript file
with its quiz, and a text file with the source video URL. A build step walks
that folder tree, validates it against Zod schemas, and renders a complete
static site into `dist/`:

- a **landing page** and a **course page** with progress tracking,
- a **real URL per lesson** (`/course/s1-ict-core/m1/m1-01`),
- per-lesson **quizzes**, per-section **final exams** and **review pages**,
- **chart figures** rendered from PNG images with a zoom/pan lightbox,
- per-lesson **local notes** and a **theme switcher**.

The site is published from `main` via GitHub Pages, and CI runs the lint,
build and verification steps on every push.

## Sections

Two sections are live, and the architecture is designed so more can be added:

| Section | Folder | Label | Contents |
| --- | --- | --- | --- |
| ICT Core | `content/s1-ict-core` | Month | Months 1–4, 38 lessons |
| 2022 Mentorship | `content/s2-2022-mentorship` | Part | Parts 1–6, 40 lessons |

The section label ("Month" vs "Part") is just data — it comes from each
section's `section.js` and drives the wording of the sidebar grouping and the
lesson numbering.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | **Astro 7** (static output, multi-page) |
| Interactivity | **React 19** islands, hydrated with `client:visible` / `client:idle` / `client:load` |
| Styling | **Tailwind CSS 4** + **DaisyUI 5** themes, plus component CSS in `src/styles/global.css` |
| Client state | **nanostores** (tiny reactive stores) persisted to `localStorage` |
| Content validation | **Zod** schemas in `src/content.config.ts` |
| Charts | Lightbox with zoom + pan (`yet-another-react-lightbox`) |
| Tooling | **pnpm** (workspace monorepo), **Biome/Ultracite** lint, **Playwright** verification |
| Docs | **Astro Starlight** in the `docs/` workspace package |

The repository is a **pnpm workspace** with two packages: the platform itself
(`.`) and the documentation site (`docs`). They share one `node_modules` and
one lockfile, but the docs site is a completely separate project that does not
interfere with the platform.

## Properties to preserve

The whole architecture exists to protect a small set of properties. Any change
you make should keep them intact:

- **Static and offline-capable.** The built site has no runtime dependencies
  and makes no external requests. Mermaid diagrams in the docs are also
  rendered client-side.
- **One place per concern.** Adding a lesson touches exactly one folder.
  Nothing to register anywhere — navigation, counts, figures and quizzes are
  derived automatically.
- **Content purity.** Course content comes *purely* from the provided source
  material (ICT's mentorship notes and the transcripts). No outside trading
  knowledge, no invented examples.
- **Verifiable.** Every content or engine change is followed by `pnpm build`
  and `pnpm verify`, which check the whole site headlessly against
  expectations derived from `content/`.

## Next steps

- [Local Setup](/getting-started/local-setup) — prerequisites and the commands you run every day.
- [Development Workflow](/getting-started/workflow) — the rules that keep the platform safe to work on.
- [Project Structure](/architecture/project-structure) — a full tour of the repository.
