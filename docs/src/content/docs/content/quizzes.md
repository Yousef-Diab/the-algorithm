---
title: Quizzes
description: The quiz.js format, authoring rules, option balance, and what the loader tolerates.
---

Every lesson has a quiz stored in its `quiz.js` — a **bare array literal**
keyed by the folder id. Quizzes render in the `Quiz` React island
(`client:visible`) and are shuffled at render time.

## The format

```js
[
  {q:"question?",o:["opt0","opt1","opt2","opt3"],a:1,e:"explanation from the notes"},
  {q:"another question?",o:["a","b","c","d"],a:3,e:"explanation"},
  …
]
```

Each item:

| Field | Meaning |
| --- | --- |
| `q` | The question text |
| `o` | Exactly **4 options** |
| `a` | **0-based index** of the correct option |
| `e` | The explanation — traceable to the notes/transcript |

Trailing `;` after the array is tolerated by the loader.

## Authoring rules

### 1. Traceability (the one rule)

The **correct option + `e` must stay traceable** to the notes/transcript.
Distractors may be invented (they're wrong on purpose), but the correct answer
and its explanation must come from the source material. See
[Content Rules](/content/rules).

### 2. Exactly 4 options

Every question has exactly 4 options. The `Quiz` component and `verify.mjs`
both assume this.

### 3. Mark the correct one with `a` only

Options are **shuffled at render time**, so position is not a tell — just
mark the correct one with `a`. Never rely on a specific position.

### 4. Balance option lengths

Keep option lengths **within ~5 characters** of each other so the correct
answer isn't conspicuously the longest. If the correct option is a concise
phrase, trim it further and flesh out terse distractors into plausible,
clearly-wrong statements; push the nuance/citation into `e`.

Example of a balanced question:

```js
{
  q: "What does the opening range represent?",
  o: [
    "The first hour of price action",
    "The session's entire trading day",
    "The weekly high and low range",
    "The last hour before the close"
  ],
  a: 0,
  e: "The notes define the opening range as the first hour of price action after the open."
}
```

## Editing an existing quiz

- Open the lesson's `quiz.js` and edit the array literal.
- Keep the file as a **bare array** — don't wrap it in `export default` or a
  variable (the loader reads the literal directly).
- After editing: `pnpm build` + `pnpm verify` (verify checks that every quiz
  renders 4 options, shuffles, grades, and resets).

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Build fails on a quiz | Not exactly 4 options, or malformed literal (e.g. missing comma). |
| Quiz doesn't render | `data-quiz` in `lesson.html` doesn't match the folder id. |
| Correct answer looks obvious | Option lengths unbalanced — trim the correct one, flesh out distractors. |
| Verification "options" check fails | A question has fewer/more than 4 options. |
