---
title: Run a Content Audit
description: How the content audit works, what it tracks, and how to extend it when coverage grows.
---

`docs/content-audit.md` is the project's content audit — a large markdown
document (currently ~675 KB) tracking the state of course content against the
source material. This page explains what it is and how to work with it.

## What it is

A **living record** of the content build-out: which lessons are authored, how
complete each lesson is, and what remains to be done. It is one of the three
legacy markdown files that live at the root of `docs/` — see
[Legacy Project Docs](/reference/legacy-docs).

:::note
The audit is a **plain markdown file**, not a Starlight page. It lives at
`docs/content-audit.md` and is read directly (or via the GitHub file view),
not rendered by the docs site.
:::

## How it relates to the docs site

The audit tracks *content completeness* (what still needs to be authored from
the source). The Starlight docs site documents *how the platform works*. They
complement each other:

| Question | Answered by |
| --- | --- |
| "Which lessons still need enrichment?" | `docs/content-audit.md` |
| "How do I enrich a lesson safely?" | [Enrich a Lesson](/guides/enrich-lesson) |
| "What's the episode→lesson map?" | `docs/s2-2022-mentorship-plan.md` + `docs/s2-2022-mentorship-videos.md` |
| "How do I add a lesson/month/section?" | [Content Authoring](/content/add-lesson) |

## When to update it

- After authoring/enriching lessons (mark them done/complete).
- When a Section's coverage changes.
- When the audit's own conventions change.

## Extending it

The audit is hand-maintained markdown. To extend it:

1. Follow its existing table/section conventions — it has a specific shape;
   preserve it.
2. Keep the counts it reports in sync with reality (lessons total, per-month,
   per-part).
3. Don't duplicate content that now lives in the docs site — link to it
   instead.

## Verify nothing else is affected

Changing `docs/content-audit.md` does **not** affect the build (it is not a
Starlight page), but the usual discipline still applies: `pnpm build` &&
`pnpm verify` before finishing any content task, and update the CHANGELOG
(`### Documentation` for audit edits).
