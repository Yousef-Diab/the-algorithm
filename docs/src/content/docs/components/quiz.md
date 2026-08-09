---
title: Quiz Component
description: The per-lesson check — rendering, shuffling, grading, and the reset contract.
---

`Quiz.tsx` renders the lesson's quiz inside the `.quiz` slot. It is a React
island hydrated with `client:visible` — it only hydrates when the quiz scrolls
into view.

## Where it lives

```text
src/components/Quiz.tsx          ← the island
content/<section>/<month>/<id>/quiz.js   ← the data (bare array literal)
```

The page passes the quiz data via `data-quiz="{lesson-id}"` on the `.quiz`
slot; the build loads the matching `quiz.js`.

## Behavior contract

- **Shuffles options at render time** — option position is never a tell; the
  correct index comes from `a` in the data.
- **Grades per question** — the user picks an option and the component marks
  it correct/incorrect with feedback.
- **Explains** — the traceable explanation (`e`) is shown after answering.
- **Persists grades** — per-question grades are stored (key `ict-quiz`) so a
  reload keeps the user's state.
- **Exposes a reset control** — the quiz's own reset clears its graded state
  (the quiz-level reset; `ResetPanel` on the course page resets everything).

## Data contract

Each item in `quiz.js`:

```ts
interface QuizQuestion {
  q: string;   // question text
  o: string[]; // exactly 4 options
  a: number;   // 0-based index of the correct option
  e: string;   // explanation, traceable to the source material
}
```

See [Quizzes](/content/quizzes) for authoring rules (4 options, balanced
lengths, traceability).

## What verify.mjs checks

For every lesson quiz, the verification suite confirms it:

1. renders **4 options**,
2. **shuffles** the options,
3. **grades** correctly (correct pick → correct; wrong pick → wrong),
4. exposes a **reset control** that actually clears the graded state.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Quiz doesn't hydrate | The `.quiz` slot is missing or `data-quiz` doesn't match the folder id. |
| Options not shuffling | Stale build — rebuild with `pnpm build`. |
| Correct answer always last | Not a bug — options are shuffled; you're seeing one random order. |
| Wrong grading | `a` doesn't point at the correct option in `quiz.js`. |
