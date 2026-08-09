---
title: Content Rules
description: The rules that govern all course content — the one rule, golden rules, and what to do when the source is ambiguous.
---

Course content is the heart of the platform, and it is governed by one
overriding rule plus a set of golden rules. Everything in this section flows
from these.

## The one rule that overrides everything

**Course content must come *purely* from the provided source material** —
ICT's mentorship notes and the video transcripts in `transcripts/` for
whichever section is being built. Do **not** add general/outside trading
knowledge, invent examples, or "improve" concepts with information that is not
in the source.

### What this means in practice

- **When enriching a lesson**, read the relevant transcript first, then write
  only what it supports.
- **Quiz questions and answer explanations** must be traceable to the
  notes/transcript, not to outside knowledge.
- **If the source is ambiguous**, prefer under-claiming over inventing. Flag
  the gap rather than filling it.
- **If a request seems to need outside knowledge**, say so instead of quietly
  adding it.

## The golden rules

### Build-artifact discipline

- The published site is a static Astro build in `dist/` produced by
  `pnpm build` from `src/` + `content/` + `images/`.
- **Never hand-edit anything under `dist/`** — it is build output.
- Edit source files only, then run `pnpm build` and `pnpm verify`.
- CI fails if the build or verification breaks, so always rebuild and verify
  before finishing a task.

### Keep the changelog updated

- Create or update `CHANGELOG.md` **before** reporting a task as done.
- Group entries under `## Unreleased` using `### Added`, `### Changed`,
  `### Fixed`, `### Documentation`, `### Verification`.
- Write human sentences, not commit logs. Never fabricate version numbers or
  release history — document only what actually changed.

### Keep the README updated

- Review `README.md` and update it if significant changes merit a mention
  (new features, major fixes, structural changes, new sections, new
  documentation files).
- Skip for trivial edits. When in doubt, ask: would someone reading the README
  benefit from knowing about this change?

### Protect main

- The repository publishes directly from `main` via GitHub Pages.
- Do not commit or push from `main` unless explicitly asked.
- When content changes, commit the `content/` changes **together with the
  rebuilt pages** — the two must stay in sync.

## What is and is not allowed in content

| Allowed | Not allowed |
| --- | --- |
| What the transcript or ICT's notes support | Outside trading knowledge |
| Concepts as taught in the source material | Invented examples |
| Styled components from the existing set | New ad-hoc CSS or new markup conventions |
| Under-claimed statements when the source is ambiguous | Guessing or "filling the gap" with general knowledge |

## Quiz authoring rules (summary)

- Exactly **4 options** per question; `a` is the 0-based index of the correct
  one.
- Options are shuffled at render time — mark the correct one with `a` only.
- **Balance option lengths** (~within 5 characters) so the correct answer
  isn't conspicuously the longest.
- Distractors may be invented (they're wrong on purpose), but the **correct
  option + explanation (`e`) must stay traceable** to the notes/transcript.

Full details: [Quizzes](/content/quizzes).

## The section review rule

Section `summary.html` pages **re-state the existing lessons** — they never
add new material. The same source-material rule applies there.

## Source material

- **Transcripts:** `transcripts/Month N/…txt` (Section 1) and
  `transcripts/2022 Mentorship/…Episode N.txt` (Section 2).
- **Section 1 notes:** `notes/ict-core/mN-NN.md` — see
  `notes/ict-core/INDEX.md` for the page-ID map and fetch recipe.
- **Section 2 notes:** `notes/2022-mentorship/ep-NN.md` plus `raw/*.png`.

:::note
**Both sources count.** For either section, the transcript *and* ICT's notes
are permitted inputs. Check a claim against both before calling it unsourced —
the notes are terse and are often what a lesson was actually written from.

Transcripts and notes are **git-ignored and local only** — never commit them.
The local copies are the permanent ones (Notion image URLs expire after ~5
minutes).
:::
