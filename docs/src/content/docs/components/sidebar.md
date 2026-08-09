---
title: Sidebar & Progress
description: The course navigation sidebar, progress tracking, the reset panel, and the notes box.
---

This page covers the course-page chrome that tracks and displays progress:
`Sidebar`, `CourseProgress`, `ResetPanel` and `Notes`.

## Sidebar (`Sidebar.tsx`)

The course navigation. Hydrated with `client:idle`.

- Groups lessons by section → month/part, using the headings from
  `months.js` (the part before the em-dash) and the section `label`
  ("Month"/"Part").
- Marks completed lessons (from `doneStore`).
- Collapses on desktop; the collapsed state persists in
  `ict-sidebar-collapsed`.
- **Scroll position persists per tab** in `sessionStorage`
  (`ict-sidebar-scroll`).

Data comes from `getGraph()` in `src/lib/graph.ts` — the nested
sections → months → lessons structure. New content appears automatically.

## CourseProgress (`CourseProgress.tsx`)

Patches the done-counts shown on the `/course` page. Hydrated with
`client:idle`. It reads `doneStore` and updates the per-section counts so the
numbers reflect the user's actual progress.

## ResetPanel (`ResetPanel.tsx`)

The reset controls on the `/course` page. Hydrated with `client:visible`.

- Clears `ict-done` (completed lessons) and `ict-quiz` (quiz grades).
- Clears `ict-exam` (exam results) — exam resets live with the other reset
  controls.

:::danger
**No reset ever clears `ict-notes`.** Per-lesson notes are the user's own
writing and are excluded from every reset path by design. Never add
`ict-notes` to a reset. See [Client State](/architecture/client-state).
:::

## Notes (`Notes.tsx`)

Per-lesson local notes. Hydrated with `client:idle`.

- One notes box per lesson, stored in `ict-notes`.
- Notes are excluded from every reset — they survive resetting progress.

## The data flow

```mermaid
flowchart LR
    G[getGraph() in lib/graph.ts] --> S[Sidebar]
    D[doneStore] --> S
    D --> CP[CourseProgress]
    D --> R[ResetPanel clears]
    R -.-> D
    N[Notes] --> NS[(ict-notes)]
    S --> SS[(sessionStorage<br/>ict-sidebar-scroll)]
```

## Progress semantics

- **Lesson count** counts real lessons only — review/exam pages carry
  `data-kind` and are excluded.
- **Progress bar** derives from `doneStore` / total lesson count.
- Review/exam pages are also excluded from the notes boxes.

See [Client State](/architecture/client-state) for the full storage contract.
