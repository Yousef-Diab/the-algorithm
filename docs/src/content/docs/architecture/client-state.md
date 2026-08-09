---
title: Client State
description: How progress, quizzes, exams, notes, theme and sidebar state are stored — the nanostores and the localStorage contract.
---

All client-side state is handled by **nanostores** (tiny reactive stores)
persisted to `localStorage`, with a small set of well-defined keys. This page
documents the contract: what is stored, where, and the rules that protect user
data.

## The stores

`src/stores/progress.ts` exports two nanostores:

| Store | Holds | Persisted to |
| --- | --- | --- |
| `doneStore` | Completed lesson ids + per-question grades | `ict-done`, `ict-quiz` |
| `examStore` | Per-section exam results | `ict-exam` |

Components subscribe to these stores (via `@nanostores/react`'s `useStore`)
and re-render automatically when they change.

## localStorage keys

| Key | Contents |
| --- | --- |
| `ict-done` | Completed lesson ids |
| `ict-quiz` | Per-question grades |
| `ict-exam` | Per-section best/last/taken/picks — picks stored by **option text**, since options re-shuffle |
| `ict-notes` | Per-lesson notes |
| `ict-theme` | `light` \| `dark` \| `system` |
| `ict-sidebar-collapsed` | Desktop sidebar collapse state |

**sessionStorage** additionally holds:

| Key | Contents |
| --- | --- |
| `ict-sidebar-scroll` | Sidebar scroll position, persisted per tab |

## Why exam picks are stored by option text

Quiz and exam options are **shuffled at render time** (see
[Quizzes](/content/quizzes)). If picks were stored by index, a re-render could
change which option the stored index points to. Storing the **option text**
makes the stored answer stable across shuffles. Keep this in mind if you touch
exam persistence.

## The reset contract

Reset controls live on the course page (`ResetPanel`). They clear progress,
quiz grades and exam results.

:::danger
**No reset ever clears `ict-notes`.** Per-lesson notes are the user's own
writing; they are excluded from every reset path by design. Keep it that way —
never add `ict-notes` to a reset.
:::

## Rules for working with state

- **Always use the stores** — never read/write `localStorage` directly from
  components. The stores centralize parsing, defaults and reactivity.
- **Keep the keys stable** — renaming a key silently loses users' saved
  progress, notes, theme or exam history.
- **Stored shapes must stay backward-compatible** — `examStore` in particular
  should only ever add fields, never remove or reinterpret existing ones.
- **Reset clears progress only** — `ict-done`, `ict-quiz`, `ict-exam`.
  Never `ict-notes`, never `ict-theme`.
