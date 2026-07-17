# The Algorithm

> *Learning to read how price is really delivered.*

A self-contained, interactive course built from **Fear.ing's** trading material — his Notion notes (with their charts) and the original **ICT (Inner Circle Trader)** video transcripts. The name nods to ICT's *interbank price delivery algorithm*: the idea that price isn't random, but delivered to engineer liquidity.

The scope grows over time. Planned sections:

1. **ICT Core — Months 1–4** *(live)* — the foundation.
2. **ICT 2022 Mentorship** *(planned)*.
3. **Fear.ing's own models & methods** *(out of scope)* — advanced SMC; his proprietary material, not for republication.

Everything lives in one HTML file that runs offline in any modern browser. No build step, no server, no dependencies.

---

## What's inside

| Path | What it is |
|------|-----------|
| `the-algorithm.html` | The entire course — markup, styles, data and app logic in one file. |
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

Just open the file:

```text
# double-click, or:
start the-algorithm.html            # Windows
```

Features:

- **Sidebar navigation** grouped by month, with per-month completion counts.
- **Lesson quizzes** that grade instantly and explain every answer.
- **Chart galleries** with a click-to-zoom lightbox.
- **Flip cards** for definitions.
- **Progress tracking** saved in the browser via `localStorage` (keys `ict-done`, `ict-quiz`). Clearing site data resets progress.

Because images load from the `images/` folder, keep the HTML file and the `images/` folder together.

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

- [ ] **Refactor for expandability.** The course is a single hand-edited file. Before adding whole new sections (2022 Mentorship, Fear.ing's models), factor content and rendering apart so new lessons/sections drop in with minimal friction (see `CLAUDE.md` → *Future direction*).
- [ ] Keep the project **AI-development friendly** — predictable conventions, one obvious place to change each thing, verifiable with a headless check.
- [ ] **Section 2 — ICT 2022 Mentorship** as its transcripts/notes become available.
- Section 3 (Fear.ing's own models) is **out of scope** — his proprietary material stays private.

---

## Verifying changes

A headless [Playwright](https://playwright.dev/python/) pass is used to confirm the course still renders after edits (all lessons present, all images load, quizzes grade, no JS errors). See `CLAUDE.md` → *Verification*.

---

## Contact

Questions, corrections, or suggestions? Reach out on Discord: **`.uzex`**
