---
title: Lightbox Component
description: The chart viewer — how it scopes images, zooms, pans, pins the panel, handles drag, and responds to the keyboard.
---

`Lightbox.tsx` is the chart viewer. Clicking a chart figure opens the **whole
lesson's** set, with prev/next browsing, zoom, and drag-to-pan. It is a React
island hydrated with `client:idle`; its styles are the `.lb-*` classes in
`src/styles/global.css`.

## Behavior contract

### Scoping

Clicking a `.fig img` opens the whole lesson's set, scoped via
`.closest('.lesson')` — so prev/next browses the **lesson's** charts without
closing the lightbox.

### Zoom

- Zoom is expressed **relative to the fitted size**: 100% = fit, max **500%**,
  step **×1.25**.
- Above fit, the stage scrolls and the image **drags to pan**.
- Keyboard: `+`/`−` zoom, `0` resets to fit.

### The pinned panel

- `.lb-stage` takes all the leftover height
  (`flex: 1 1 auto; min-height: 0`) so the **caption and panel sit at a fixed
  spot** regardless of the image's aspect ratio or the zoom level.
- **Don't give the stage a content-sized height** — the panel starts hopping
  about.

### Centering

- The stage centres with `align-items: safe center` + `justify-content: safe
  center` — without them the top/left of a zoomed image becomes unreachable.

### Dragging

- Dragging is implemented with **pointer capture** on the stage
  (`stage.setPointerCapture`).
- Close-on-outside-click only fires when the click target is the **dialog
  backdrop** (`e.target === e.currentTarget`).
- After a drag, Chromium retargets the follow-up click from the image to the
  stage, so the lightbox **won't close mid-drag** — verify close-on-outside-
  click with **real mouse input, never `el.click()`** (synthetic clicks bypass
  the retargeting and hide the bug).

### Keyboard

While open:

| Key | Action |
| --- | --- |
| `Esc` | Close |
| `←` / `→` | Browse prev / next |
| `+` / `−` | Zoom in / out |
| `0` | Reset to fit |

### Body lock & resize

- Body scroll locks via `body.lb-lock`.
- The image **re-fits on window resize**.

## The stage anatomy

```text
.lightbox (dialog backdrop)
└── .lb-panel (pinned panel)
    ├── .lb-top (caption row)          ← fixed spot
    ├── .lb-stage (flex: 1 1 auto; min-height: 0)   ← scrollable, centered
    │   └── img (zoom transform, drags to pan)
    └── .lb-controls (buttons)         ← fixed spot
```

## What verify.mjs checks

The verification suite confirms the lightbox:

1. **opens** on a figure click,
2. **browses** the lesson's charts (prev/next),
3. **zooms**,
4. **closes on an outside click** but **not on a click on the image**.

:::note
The close-on-outside-click check uses real mouse input by design — see
"Dragging" above.
:::

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Panel jumps while zooming | `.lb-stage` has a content-sized height; it must be `flex: 1 1 auto; min-height: 0`. |
| Zoomed image can't reach top/left | Missing `align-items: safe center` / `justify-content: safe center`. |
| Lightbox closes mid-drag | Pointer-capture/backdrop logic regressed; verify with real mouse. |
| Lightbox shows wrong charts | Scoping via `.closest('.lesson')` broke; the lesson wrapper changed. |
