---
title: Fix a Quiz
description: "Tutorial — how to repair a quiz: wrong answer index, unbalanced options, untraceable explanations, or a malformed file."
---

Quizzes break in a few predictable ways. This guide walks through each
symptom and its fix.

## Step 1 — Open the quiz

```text
content/<section>/<month>/<id>/quiz.js
```

It's a **bare array literal** — no `export`, no wrapper:

```js
[
  {q:"…",o:["…","…","…","…"],a:1,e:"…"},
  …
]
```

## Step 2 — Identify the symptom

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails on this quiz | Malformed literal (missing comma, unbalanced braces) or a question without exactly 4 options | Repair the literal; make every `o` exactly 4 entries |
| Correct answer marks wrong | `a` doesn't point at the correct option | Set `a` to the correct 0-based index |
| Correct answer is obvious | The correct option is much longer/shorter than the distractors | Balance lengths (~within 5 characters); push nuance into `e` |
| Explanation is vague or from outside knowledge | `e` isn't traceable | Rewrite `e` from the notes/transcript |
| Quiz renders wrong questions | `data-quiz` in `lesson.html` ≠ folder id | Align them |
| Verification "options" check fails | A question has ≠ 4 options | Fix the count |

## Step 3 — Balance the options

Compare lengths. Example of a **leaky** question:

```js
{ q:"What is the opening range?", o:[
  "The first hour of price action after the open",
  "High", "Low", "Range"
], a:0, e:"…" }
```

The correct answer is conspicuously long. **Fixed** version:

```js
{ q:"What is the opening range?", o:[
  "The first hour of price action",
  "The session's entire trading day",
  "The weekly high and low range",
  "The last hour before the close"
], a:0, e:"The notes define the opening range as the first hour of price action after the open." }
```

## Step 4 — Verify traceability

The **correct option + `e`** must be traceable to the notes/transcript.
Distractors may be invented, but they must be *plausible and clearly wrong* —
a distractor that's a real (but untaught) concept is fine as long as the
question's intended answer stays unambiguous.

## Step 5 — Build and verify

```bash
pnpm build
pnpm verify
```

`verify` checks every quiz: 4 options render, shuffling happens, grading is
correct, and the reset control clears the graded state.

## Step 6 — Document and commit

- `CHANGELOG.md`: `### Fixed` — "Fixed quiz question X in lesson Y".
- Commit on a feature branch (content together with rebuilt pages).

## Checklist

- [ ] Literal is valid; every `o` has exactly 4 options.
- [ ] `a` points at the correct option.
- [ ] Option lengths balanced (~within 5 chars).
- [ ] Correct option + `e` traceable to the source.
- [ ] `pnpm build` && `pnpm verify` pass.
