# The Algorithm

> *Learning to read how price is really delivered.*

**▶ [Open the course live](https://yousef-diab.github.io/the-algorithm/)**

A self-contained, interactive course built from **Fear.ing's** trading material — his Notion notes (with their charts) and the original **ICT (Inner Circle Trader)** video transcripts. The name nods to ICT's *interbank price delivery algorithm*: the idea that price isn't random, but delivered to engineer liquidity.

The scope grows over time. Planned sections:

1. **ICT Core — Months 1–4** *(live)* — the foundation.
2. **ICT 2022 Mentorship** *(planned)*.
3. **Fear.ing's own models & methods** *(out of scope)* — advanced SMC; his proprietary material, not for republication.

The published site is a single HTML file that runs offline in any modern browser — no server, no dependencies. Under the hood, that file is **assembled from per-lesson source files by a small Python build** (`build.py`), so it stays easy to expand without giving up the "just open it" property.

---

## What's inside

| Path | What it is |
|------|-----------|
| `content/` | Lesson source, one folder per lesson: `content/<section>/<month>/<id>/` holding `lesson.html`, `quiz.js`, `video.txt`. **This is what you edit.** |
| `engine/` | The rendering shell + app logic (styles, page frame, `app.js`) — rarely changes. |
| `build.py` | Assembles `content/` + `engine/` into `index.html` (validates ids/quizzes as it goes). |
| `verify.py` | Rebuilds, then headless-checks the whole course (lessons, images, quizzes, no JS errors). Run `python verify.py` after editing. |
| `index.html` | **Build artifact** — the entire course in one offline file. Generated; don't hand-edit. |
| `images/` | Chart images scraped from the notes, named `{slug}-{NN}.png` (e.g. `m4-03-orderblocks-07.png`). |
| `transcripts/` | Source ICT video transcripts, organised `Month 1` … `Month 4`. **Git-ignored** (local source material only). |
| `.claude/` | Claude Code local settings. |
| `CLAUDE.md` | Working guide for AI-assisted development — read this before editing. |

Section 1 (ICT Core) currently covers **4 months, 38 lessons**, each with note charts and a lesson quiz.

| Month | Theme |
|-------|-------|
| 1 | Reading the conditions — trade-setup elements, market-maker conditioning, equilibrium / discount / premium, fair valuation, liquidity runs, protraction. |
| 2 | Risk & trade selection — small accounts, framing low-risk setups, 10% months, mitigating losses, high-reward selection, first market-maker traps. |
| 3 | Institutional analysis — timeframe selection, order flow, sponsorship, anticipatory skills, SMT, macro-to-micro, more traps. |
| 4 | The PD arrays — orderblocks, mitigation / breaker / rejection / reclaimed / propulsion / vacuum blocks, liquidity pools, voids, FVGs, phantoms. |

---

## Using the course

**Online:** just open **<https://yousef-diab.github.io/the-algorithm/>** — nothing to install.

**Offline:** clone the repo and open `index.html` in any browser (keep it next to the `images/` folder, since charts load from there).

What you get:

- **Sidebar navigation** grouped by month, with per-month completion counts.
- **Lesson quizzes** that grade instantly and explain every answer.
- **Chart galleries** with a click-to-zoom lightbox.
- **Flip cards** for definitions.
- **Progress tracking** saved in the browser via `localStorage` (keys `ict-done`, `ict-quiz`). Clearing site data resets progress.

---

## Content principle (important)

> **All course content comes purely from the provided source material** — Fear.ing's notes and the video transcripts for whichever section is being built. General/outside trading knowledge is deliberately **not** used. Every lesson explanation and quiz answer is traceable to that source material.

This constraint is intentional and should be preserved in all future edits. See `CLAUDE.md` for how it shapes the workflow.

---

## Credits

- **Notion notes & charts** — by the trader **Fear.ing**. Community / mentorship: [whop.com/vincere-aut-mori](https://whop.com/vincere-aut-mori/?a=ydiab4)
- **Video transcripts** — original ICT (Inner Circle Trader) mentorship core-content videos.

This project is a personal study aid that reorganises the above material into an interactive format. All credit for the underlying teaching belongs to the original creators.

---

## Roadmap / future to-do

- [x] **Refactor for expandability.** Content and rendering are now split: lessons live in `content/<section>/<month>/<id>/` and `build.py` assembles the offline `index.html`. New lessons/sections drop in as folders (see `CLAUDE.md` → §2 / §4).
- [x] **AI-development friendly.** One obvious edit point per change (§4), `build.py` validates as it assembles, an `add-content` skill scaffolds lessons/months/sections, and `verify.py` + CI enforce a headless check (and that `index.html` is never committed stale) on every PR.
- [ ] **Section 2 — ICT 2022 Mentorship** as its transcripts/notes become available.
- Section 3 (Fear.ing's own models) is **out of scope** — his proprietary material stays private.

---

## Verifying changes

Run **`python verify.py`** after any edit. It rebuilds `index.html`, then loads it in headless [Playwright](https://playwright.dev/python/) Chromium and checks every lesson is present, all charts load, quizzes shuffle and grade, and there are no JS errors — exiting non-zero (with the problems) on failure. The same check runs in **CI on every PR**, which also fails if the committed `index.html` is out of sync with `content/`. One-time setup: `pip install playwright && python -m playwright install chromium`.

---

## Contact

Questions, corrections, or suggestions? Reach out on Discord: **`.uzex`**
