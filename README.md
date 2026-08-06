# The Algorithm

> *Learning to read how price is really delivered.*

**▶ [Open the course live](https://yousef-diab.github.io/the-algorithm/)**

A self-contained, interactive course built from **ICT's (Inner Circle Trader) Mentorships** — the mentorship notes and their charts, together with the original video transcripts. The name nods to ICT's *interbank price delivery algorithm*: the idea that price isn't random, but delivered to engineer liquidity.

Two sections, **78 lessons**, both live:

1. **ICT Core — Months 1–4** — 38 lessons; the foundation.
2. **ICT 2022 Mentorship — Parts 1–6** — 40 lessons, one per episode; a single stripped-down intraday model taught end to end.

The published site is a single HTML file that runs offline in any modern browser — no server, no dependencies. Under the hood, that file is **assembled from per-lesson source files by a small Python build** (`build.py`), so it stays easy to expand without giving up the "just open it" property.

---

## What's inside

| Path | What it is |
|------|-----------|
| `content/` | Course source. One folder per lesson — `content/<section>/<month>/<id>/` holding `lesson.html`, `quiz.js`, `video.txt` — plus each section's `section.js`, `months.js`, `summary.html` and `exam.js`. **This is what you edit.** |
| `engine/` | The rendering shell + app logic (styles, page frame, `app.js`) — rarely changes. |
| `build.py` | Assembles `content/` + `engine/` into `index.html` (validates ids/quizzes as it goes). |
| `verify.py` | Rebuilds, then headless-checks the whole course (lessons, images, quizzes, resets, section exams, no JS errors). Run `python verify.py` after editing. |
| `index.html` | **Build artifact** — the entire course in one offline file. Generated; don't hand-edit. |
| `images/` | Chart images scraped from the notes, named `{slug}-{NN}.png` (e.g. `m4-03-orderblocks-07.png`). |
| `transcripts/` | Source ICT video transcripts — `Month 1` … `Month 4` for Section 1, `2022 Mentorship` for Section 2. **Git-ignored** (local source material only). |
| `notes/` | Section 2's harvested mentorship notes and their staging charts. **Git-ignored** (local source material only). |
| `.claude/` | Claude Code local settings. |
| `CLAUDE.md` | Working guide for AI-assisted development — read this before editing. |

### Section 1 — ICT Core

**4 months, 38 lessons**, each with note charts and a lesson quiz — plus a section summary and a 45-question final exam.

| Month | Theme |
|-------|-------|
| 1 | Reading the conditions — trade-setup elements, market-maker conditioning, equilibrium / discount / premium, fair valuation, liquidity runs, protraction. |
| 2 | Risk & trade selection — small accounts, framing low-risk setups, 10% months, mitigating losses, high-reward selection, first market-maker traps. |
| 3 | Institutional analysis — timeframe selection, order flow, sponsorship, anticipatory skills, SMT, macro-to-micro, more traps. |
| 4 | The PD arrays — orderblocks, mitigation / breaker / rejection / reclaimed / propulsion / vacuum blocks, liquidity pools, voids, FVGs, phantoms. |

### Section 2 — ICT 2022 Mentorship

**6 parts, 40 lessons** — one lesson per episode of the free 2022 YouTube mentorship, so every lesson is traceable to exactly one transcript. Each has a lesson quiz, plus a section summary and a 40-question final exam. (Episode 28 is omitted: the video has no audio and there is no source to author from.)

| Part | Episodes | Theme |
|------|----------|-------|
| 1 | 1–7 | Foundations & the 2022 model — the fair value gap candle by candle, the liquidity run and market structure shift that qualify it, displacement, premium & discount, framing the day. |
| 2 | 8–13 | Order blocks, Power of Three & structure — how a block is actually found, the opening range, the halo system, and the rebalance that leaves a key high or low. |
| 3 | 14–19 | Sessions, targeting & the daily narrative — the three-chart workflow, multiple setups in one session, the forex variations, bias off the daily dealing range, and when to stand aside. |
| 4 | 20–25 | Correlation & tape reading — the dollar index, risk on / risk off, SMT divergence, the fib settings, news days, the two entry patterns, daily rebalance theory. |
| 5 | 26–33 | Session playbooks & special days — counter-trend ideas, narrow range days, the PM session, consolidation days, confluence, and back testing as pseudo-experience. |
| 6 | 34–41 | Dealing range, algorithmic theory & risk — the mean threshold, changing gears mid-session, the four times of day, the six keys to daily bias, position sizing and stops. |

---

## Using the course

**Online:** just open **<https://yousef-diab.github.io/the-algorithm/>** — nothing to install.

**Offline:** clone the repo and open `index.html` in any browser (keep it next to the `images/` folder, since charts load from there).

What you get:

- **Sidebar navigation** grouped by section, then by month (Section 1) or part (Section 2), with completion counts on each.
- **Lesson quizzes** that grade instantly and explain every answer — each resettable on its own.
- **Section review**: a one-page summary of everything in the section, and a **final exam** that grades on submit against an 80% pass mark, keeps your best score, and can be retaken.
- **Chart galleries** with a click-to-zoom viewer: browse every chart in the lesson with
  the on-screen controls or ← / →, zoom to 500% (`+` / `−` / `0`) and drag to pan,
  and close by pressing Escape or clicking anywhere outside the image and its panel.
- **Flip cards** for definitions.
- **Per-lesson notes** you can jot as you go, saved locally.
- **Progress tracking** saved in the browser via `localStorage` (keys `ict-done`, `ict-quiz`, `ict-exam`, `ict-notes`).
- **Reset controls** on the home page — clear quizzes, exams or progress independently (or all three). Your notes are never touched.

---

## Content principle (important)

> **All course content comes purely from the provided source material** — ICT's mentorship notes and the video transcripts for whichever section is being built. General/outside trading knowledge is deliberately **not** used. Every lesson explanation and quiz answer is traceable to that source material.

This constraint is intentional and should be preserved in all future edits. See `CLAUDE.md` for how it shapes the workflow.

---

## Credits

- **Mentorship notes & charts** — from ICT's (Inner Circle Trader) mentorships.
- **Video transcripts** — original ICT (Inner Circle Trader) mentorship core-content videos.

This project is a personal study aid that reorganises the above material into an interactive format. All credit for the underlying teaching belongs to the original creators.

---

## Roadmap / future to-do

- [x] **Refactor for expandability.** Content and rendering are now split: lessons live in `content/<section>/<month>/<id>/` and `build.py` assembles the offline `index.html`. New lessons/sections drop in as folders (see `CLAUDE.md` → §2 / §4).
- [x] **AI-development friendly.** One obvious edit point per change (§4), `build.py` validates as it assembles, an `add-content` skill scaffolds lessons/months/sections, and `verify.py` + CI enforce a headless check (and that `index.html` is never committed stale) on every PR.
- [x] **Section 2 — ICT 2022 Mentorship.** All 40 lessons built from the episode transcripts and notes, with a section summary and final exam. See [`docs/s2-2022-mentorship-plan.md`](docs/s2-2022-mentorship-plan.md) for how it was scoped and built.
- [ ] **A section switcher in the sidebar**, now that there is more than one section.

---

## Verifying changes

Run **`python verify.py`** after any edit. It rebuilds `index.html`, then loads it in headless [Playwright](https://playwright.dev/python/) Chromium and checks every lesson is present, all charts load, quizzes shuffle and grade, and there are no JS errors — exiting non-zero (with the problems) on failure. The same check runs in **CI on every PR**, which also fails if the committed `index.html` is out of sync with `content/`. One-time setup: `pip install playwright && python -m playwright install chromium`.

---

## Contact

Questions, corrections, or suggestions? Reach out on Discord: **`.uzex`**
