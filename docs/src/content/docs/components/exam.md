---
title: Exam Component
description: The section final exam — submission-only grading, the 80% pass mark, retakes, and persistence.
---

`Exam.tsx` renders the section's final exam on the generated
`/course/[section]/exam` page. It is a React island hydrated with
`client:visible`.

## Where the exam comes from

There is no exam HTML to write. The page
`src/pages/course/[section]/exam.astro` loads the section's `exam.js` (a bare
array literal, same shape as `quiz.js`) and renders `Exam` with it. The
question count regenerates itself.

```text
content/<section>/exam.js         ← the questions
src/pages/course/[section]/exam.astro ← the route
src/components/Exam.tsx           ← the island
```

## Behavior contract

- **Grades nothing until Submit** — no live scoring while answering.
- **Pass mark: 80%** — the exam scores against 80%.
- **Can be retaken** — after submission the user can take it again.
- **Persists results per section** — stored under `ict-exam`:
  best/last/taken and the user's picks.
- **Picks are stored by option text**, not index — because options are
  shuffled at render time, the stored answer must survive re-shuffles. See
  [Client State](/architecture/client-state).

## Data contract

Same as quizzes — exactly 4 options, `a` = 0-based correct index,
explanation `e` traceable to the source:

```ts
interface ExamQuestion {
  q: string;   // question text
  o: string[]; // exactly 4 options
  a: number;   // 0-based index of the correct option
  e: string;   // explanation
}
```

Authoring rules: [Exams & Summaries](/content/exams).

## What verify.mjs checks

The verification suite confirms the exam page:

1. renders,
2. **scores on submit** (full answers → 100% pass),
3. **retake** works (can submit again),
4. the **question count stated in `summary.html` prose matches the rendered
   exam** (a summary may state no count; it may not state a wrong one).

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Exam page 404s | `exam.js` missing or malformed in the section folder. |
| Wrong question count on review page | `summary.html` prose states a count that doesn't match `exam.js`. |
| Stored answers shift after reload | Unlikely if picks are stored by text; if by index, that's the bug — see Client State. |
