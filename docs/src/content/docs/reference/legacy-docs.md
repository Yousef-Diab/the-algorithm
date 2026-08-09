---
title: Legacy Project Docs
description: The three legacy markdown files at the root of docs/ — what they are, what they contain, and how they relate to this docs site.
---

The repository's `docs/` folder has **two kinds of documentation**: this
Starlight site (in `docs/src/content/docs/`) and three **legacy markdown
files** that live at the root of `docs/`. The legacy files are project plans,
audits and reference material — they are **not** Starlight pages and are
deliberately kept at the root, untouched.

## The three files

| File | Size | What it is |
| --- | --- | --- |
| `docs/content-audit.md` | ~675 KB | The content audit — tracks the build-out state of course content against the source material. |
| `docs/s2-2022-mentorship-plan.md` | ~12 KB | The Section 2 (2022 Mentorship) build plan — episode→lesson map, session batching, progress tracker. |
| `docs/s2-2022-mentorship-videos.md` | ~3 KB | The Section 2 episode→video URL map — the authoritative source for `video.txt` URLs. |

## What each one is for

### `content-audit.md`

A living record of content completeness: which lessons are authored, how
complete each is, what remains. Read it to know the current build-out state;
update it after authoring/enriching lessons. See
[Run a Content Audit](/guides/content-audit).

### `s2-2022-mentorship-plan.md`

The operating plan for Section 2 work. **Read it before doing any Section 2
work** — it holds the episode→lesson map, session batching and the progress
tracker. Update it when the mapping or progress changes.

### `s2-2022-mentorship-videos.md`

The episode→video URL map for the 2022 Mentorship. When setting a lesson's
`video.txt`, the real source URL comes from here (or the equivalent Section 1
source). See [Videos](/content/videos).

## Golden rules for these files

- **Don't delete or move them.** They stay at the root of `docs/` by design.
- **Don't convert them into Starlight pages** — Starlight only reads
  `docs/src/content/docs/`; these stay as plain markdown.
- **Update them when the plans change** (see
  [Keep Docs in Sync](/guides/keep-docs-in-sync)).
- **Link, don't duplicate** — the docs site references them (as this page
  does) instead of copying their content.

## The docs site vs. the legacy files

| Concern | Lives in |
| --- | --- |
| How the platform works (architecture, components, workflows) | This docs site |
| What content still needs authoring | `docs/content-audit.md` |
| Section 2 episode→lesson mapping and progress | `docs/s2-2022-mentorship-plan.md` |
| Section 2 episode→video URLs | `docs/s2-2022-mentorship-videos.md` |
