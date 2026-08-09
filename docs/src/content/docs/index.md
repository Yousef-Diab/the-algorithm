---
title: The Algorithm — Documentation
description: Developer documentation for The Algorithm, an interactive ICT mentorship course built with Astro.
---

Welcome to the developer documentation for **The Algorithm** — an interactive
course built from ICT's (Inner Circle Trader) Mentorships. The platform is a
static multi-page Astro site with React islands for interactivity, and it is
fully offline-capable once built.

This documentation explains **how the platform works** and **how to work on it
safely**: every process, every convention, and every workflow you need to
modify, add, or fix content and code without breaking anything.

## Quick Start

```bash
pnpm install       # install everything (root platform + docs workspace)
pnpm dev           # run the platform at http://localhost:4321
pnpm docs:dev      # run this documentation site at http://localhost:4322
```

Every change to the platform is validated with:

```bash
pnpm build         # sync images, then build the static site into dist/
pnpm verify        # headless end-to-end checks against dist/
```

## Documentation Map

| Section | Covers |
| ------- | ------ |
| [Getting Started](/getting-started/overview) | What the platform is, the tech stack, local setup, and the development workflow that keeps everything safe. |
| [Architecture](/architecture/project-structure) | Project structure, data model, the content pipeline, rendering, client state, and the build system — with diagrams. |
| [Content Authoring](/content/rules) | The rules that govern course content, plus step-by-step tutorials for adding lessons, months, sections, quizzes, exams, charts, and videos. |
| [Components](/components/overview) | Every interactive component — Quiz, Exam, Lightbox, Sidebar, Notes and more — with real code examples. |
| [Guides & Tutorials](/guides/enrich-lesson) | Practical workflows: enriching a lesson, fixing a quiz, adding charts, running a content audit, and keeping the docs in sync. |
| [Development](/development/scripts) | Scripts reference, lint & format rules, the verification suite, CI/CD, and deployment to GitHub Pages and Coolify. |

## Golden Rules at a Glance

- **Course content comes purely from the source material** — ICT's mentorship
  notes and the transcripts in `transcripts/`. Never add outside trading
  knowledge or invented examples.
- **Never hand-edit `dist/`** — it is build output; any manual change is
  overwritten on the next build.
- **`pnpm build`, then `pnpm verify`** — CI fails if either breaks.
- **Keep `CHANGELOG.md`, `README.md`, and `docs/` updated** when your change
  touches what they document.
- **Never commit or push from `main`** unless explicitly asked — this
  repository publishes directly from `main` via GitHub Pages.

See [Content Rules](/content/rules) and the
[Development Workflow](/getting-started/workflow) for the full picture.
