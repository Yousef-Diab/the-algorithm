---
title: Videos
description: How video links work — video.txt, rendering rules, and the no-invented-URLs rule.
---

Each lesson can link to its source video. The link comes from a single file:
`video.txt`, one line, holding the **real** source video URL.

## The file

```text
content/<section>/<month>/<id>/video.txt
```

Contents (one line, plain text):

```text
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## Rendering rules

| `video.txt` state | Result |
| --- | --- |
| Non-empty (a URL) | A video link renders on the lesson page; it opens in a new tab. |
| Empty file | No link rendered. |

:::danger
**Never invent a URL.** The `video.txt` file must contain the real source
video URL for the lesson. If you don't have the real URL, leave the file
empty.
:::

## Changing a lesson's video

1. Edit that lesson's `video.txt` (one line, real source URL).
2. Rebuild + verify:

```bash
pnpm build
pnpm verify
```

`verify.mjs` checks that **a video link renders for each lesson with a
non-empty `video.txt`**.

## Where the URLs come from

- **Section 1:** the source videos for the ICT Core lessons.
- **Section 2:** the episode videos listed in
  `docs/s2-2022-mentorship-videos.md` — the authoritative episode→video map
  for the 2022 Mentorship.

If a lesson has no known source video, leave `video.txt` empty rather than
guessing.
