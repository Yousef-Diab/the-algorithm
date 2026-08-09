<div align="center">

# 📈 The Algorithm

### Learning to read how price is really delivered.

An interactive, self-contained course built from **ICT's (Inner Circle Trader) Mentorships** — the mentorship notes, their charts, and the original video transcripts.

[![Live site](https://img.shields.io/badge/🚀-Live%20course-4f8cff?style=for-the-badge&logo=githubpages&logoColor=white)](https://yousef-diab.github.io/the-algorithm/)
[![CI — build & verify](https://img.shields.io/github/actions/workflow/status/Yousef-Diab/the-algorithm/ci.yml?style=for-the-badge&label=CI&logo=githubactions&logoColor=white)](https://github.com/Yousef-Diab/the-algorithm/actions)
[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)

</div>

---

## 📖 About

**The Algorithm** is a free, interactive study aid that turns ICT's (Inner Circle Trader) mentorships into a structured course: **78 lessons** across two sections, each with note charts, an instant-grading quiz, and a link to the original source video. The name nods to ICT's *interbank price delivery algorithm* — the idea that price isn't random, but delivered to engineer liquidity.

The site is a **fully static, multi-page build** that runs entirely in the browser — no server, no runtime dependencies, fully offline-capable once built.

| Section | Lessons | Status |
|---------|--------:|--------|
| **1 — ICT Core** (Months 1–4) | 38 | ✅ Live |
| **2 — ICT 2022 Mentorship** (Parts 1–6) | 40 | ✅ Live |

> ⚠️ **Content principle:** all course content comes *purely* from the provided source material — ICT's mentorship notes and the video transcripts. No general/outside trading knowledge is added. Every explanation and quiz answer is traceable to that source.

---

## ✨ Features

- **Two complete sections, 78 lessons** — ICT Core (Months 1–4, the foundation) and the ICT 2022 Mentorship (Parts 1–6, one stripped-down intraday model taught end to end).
- **Real URLs per lesson** — every lesson is its own static page, so links are shareable and history/back-forward just work.
- **Instant-grading quizzes** — 4 options per question, shuffled at render time, with explanations for every answer and per-quiz reset.
- **Section summaries & final exams** — a one-page revision summary per section plus a final exam that grades on **Submit**, requires **80% to pass**, remembers your best score, and can be retaken.
- **Chart galleries with a lightbox viewer** — browse the whole lesson's charts (on-screen controls or `←`/`→`), zoom up to **500%** (`+`/`−`/`0`), drag to pan, close with `Esc` or by clicking outside the image.
- **Flip cards** — for definitions and quick recall.
- **Per-lesson notes** — jot down notes as you go, saved locally (explicit "Save notes" button, never auto-saved mid-typing).
- **Progress tracking** — completion state, quiz grades, exam results and notes persist in `localStorage`; the sidebar shows done-counts per month/part.
- **Collapsible, persistent sidebar** — months collapse/expand, months auto-close when completed, full sidebar collapse on desktop, and scroll position is remembered across navigations.
- **Light / dark / system themes** — with anti-FOUC inline script and persisted preference.
- **Smooth view transitions** — Astro `ClientRouter` crossfades between pages.
- **Responsive & accessible** — mobile drawer with tap-outside-to-close, skip link, `:focus-visible` styles, `prefers-reduced-motion` support, and keyboard-operable controls.

---

## 🚀 Quick start

### Prerequisites

- **Node.js 24+**
- **pnpm 11** (`corepack enable` or `npm i -g pnpm`)

### Install & run locally

```bash
# 1. Install dependencies
pnpm install

# 2. Dev server with hot reload (runs sync-images first)
pnpm dev

# 3. Production build → dist/
pnpm build

# 4. Preview the built site locally
pnpm preview
```

### Verify & lint

```bash
pnpm verify    # headless end-to-end checks against dist/ (run after pnpm build)
pnpm check     # lint + format check (Ultracite + Biome — what CI runs)
pnpm fix       # auto-fix everything Biome considers safe
```

One-time setup for verification: `pnpm install`, then `pnpm exec playwright install chromium`.

### Run the docs site

The documentation is a separate Starlight project in `docs/` (own workspace package, port `4322` — the platform stays on `4321`). See [📄 Documentation](#-documentation) below.

```bash
pnpm docs:dev       # docs dev server → http://localhost:4322
pnpm docs:build     # build the docs site → docs/dist/
```

---

## 🧰 Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Astro 7](https://astro.build) — static multi-page output, custom content loaders |
| **UI islands** | [React 19](https://react.dev) with `client:visible` / `client:idle` / `client:load` hydration |
| **Language** | [TypeScript](https://www.typescriptlang.org) (strict), Zod-validated content collections |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com) (custom `trading` / `trading-light` themes) |
| **State** | [nanostores](https://github.com/nanostores/nanostores) + `@nanostores/react` (localStorage-backed progress) |
| **Package manager** | [pnpm](https://pnpm.io) |
| **Lint / format** | [Biome 2.5.6](https://biomejs.dev) + [Ultracite](https://github.com/its-danny/ultracite) preset |
| **E2E verification** | [Playwright](https://playwright.dev) (headless Chromium) |
| **CI / CD** | GitHub Actions — CI on every PR/push, auto-deploy to GitHub Pages on `main` |

---

## 📁 Project structure

```text
src/
  pages/                     ← routes (landing, /course, lessons, review, exam, 404)
  layouts/                   ← BaseLayout (head, theme, favicon) + CourseLayout (header, sidebar, lightbox)
  components/                ← .astro components + React islands (.tsx)
    Header.astro             ← topbar (brand + theme switcher)
    ThemeToggle.tsx          ← light / dark / system (client:load)
    Sidebar.tsx              ← course nav + progress (client:idle)
    Quiz.tsx                 ← lesson check (client:visible)
    Exam.tsx                 ← section final exam (client:visible)
    Notes.tsx                ← per-lesson local notes (client:idle)
    LessonFooter.tsx         ← prev / mark complete / next (client:idle)
    ResetPanel.tsx           ← reset controls on /course (client:visible)
    CourseProgress.tsx       ← patches done-counts on /course (client:idle)
    Lightbox.tsx             ← chart lightbox, zoom + pan (client:idle)
    Figure.astro             ← server-side chart figures from fig-slots
    SiteFooter.astro
  lib/
    course.ts                ← types + u() base-URL helper
    graph.ts                 ← getGraph() nested sections→months→lessons
  stores/
    progress.ts              ← nanostores: doneStore + examStore (localStorage)
  styles/
    global.css               ← Tailwind 4 + DaisyUI 5 themes + component CSS
  content.config.ts          ← custom loaders + Zod schemas (walks content/)
content/                     ← course source (this is what you edit)
  <section>/                 ← section.js (meta) + months.js + summary.html + exam.js
    <month>/<lesson>/        ← one folder per lesson
      lesson.html            ← the <section class="lesson"> markup, verbatim
      quiz.js                ← this lesson's quiz array literal
      video.txt              ← the source video URL (one line; empty = no link)
images/                      ← {slug}-NN.png chart files (340 charts, counts auto-derived)
scripts/
  sync-images.mjs            ← mirrors images/ → public/images before every build/dev
verify.mjs                   ← headless end-to-end checks (Node + Playwright)
public/                      ← copied verbatim to dist (favicon, images mirror)
dist/                        ← BUILD OUTPUT (gitignored, served by GitHub Pages — never hand-edit)
docs/                        ← a SECOND, fully separate project: the Starlight docs site (own package, :4322)
  src/content/docs/          ←   the documentation pages (Markdown + Mermaid diagrams)
  package.json               ←   docs workspace package (runs independently of the platform)
  + the legacy project docs  ←   content-audit.md, s2-2022-mentorship-plan.md, s2-2022-mentorship-videos.md
AGENTS.md / CLAUDE.md        ← working guides for AI-assisted development
DESIGN.md                    ← visual source of truth (design tokens)
CHANGELOG.md                 ← keep-a-changelog history
```

> **Legacy files:** `build.py`, `verify.py`, `engine/` and the stale `index.html` belong to the previous single-file Python build. They are obsolete and kept for reference only — never edit or run them.

---

## 📚 Course content

### Section 1 — ICT Core (`content/s1-ict-core`)

**4 months · 38 lessons**, each with note charts and a lesson quiz, plus a section summary and a **45-question final exam**.

| Month | Theme |
|-------|-------|
| 1 | Reading the conditions — trade-setup elements, market-maker conditioning, equilibrium / discount / premium, fair valuation, liquidity runs, protraction |
| 2 | Risk & trade selection — small accounts, framing low-risk setups, 10% months, mitigating losses, high-reward selection, first market-maker traps |
| 3 | Institutional analysis — timeframe selection, order flow, sponsorship, anticipatory skills, SMT, macro-to-micro, more traps |
| 4 | The PD arrays — orderblocks, mitigation / breaker / rejection / reclaimed / propulsion / vacuum blocks, liquidity pools, voids, FVGs, phantoms |

### Section 2 — ICT 2022 Mentorship (`content/s2-2022-mentorship`)

**6 parts · 40 lessons** — one lesson per episode of the free 2022 YouTube mentorship, so every lesson is traceable to exactly one transcript. Each has a lesson quiz, plus a section summary and a **40-question final exam**. (Episode 28 is omitted: the video has no audio and there is no source to author from.)

| Part | Episodes | Theme |
|------|----------|-------|
| 1 | 1–7 | Foundations & the 2022 model — the fair value gap candle by candle, the liquidity run and market structure shift that qualify it, displacement, premium & discount, framing the day |
| 2 | 8–13 | Order blocks, Power of Three & structure — how a block is actually found, the opening range, the halo system, and the rebalance that leaves a key high or low |
| 3 | 14–19 | Sessions, targeting & the daily narrative — the three-chart workflow, multiple setups in one session, the forex variations, bias off the daily dealing range, and when to stand aside |
| 4 | 20–25 | Correlation & tape reading — the dollar index, risk on / risk off, SMT divergence, the fib settings, news days, the two entry patterns, daily rebalance theory |
| 5 | 26–33 | Session playbooks & special days — counter-trend ideas, narrow range days, the PM session, consolidation days, confluence, and back testing as pseudo-experience |
| 6 | 34–41 | Dealing range, algorithmic theory & risk — the mean threshold, changing gears mid-session, the four times of day, the six keys to daily bias, position sizing and stops |

---

## 🧩 How the content model works

The site is **data-driven**: Astro content collections load `content/` at build time via custom loaders in `src/content.config.ts`, so adding content never touches the rendering code.

- **Adding a lesson** → create `content/<section>/<month>/<id>/` with `lesson.html`, `quiz.js` and `video.txt`. Nav, footer, cards and counts update automatically.
- **Adding a month/part** → add one `{id, title, desc}` entry to that section's `months.js`.
- **Adding a section** → new `content/<sN-name>/` folder with `section.js` + `months.js`.
- **Charts** → drop `images/{slug}-NN.png` files; counts are auto-derived. A missing image auto-removes its figure, and galleries render when a lesson has more than 2 charts.
- **Quizzes / exams** → bare array literals (`[{q, o:[…4…], a, e}, …]`), keyed by lesson/section folder id; options are shuffled at render time.
- **Scaffolding** → the `add-content` skill automates new lessons, months and whole sections (see `AGENTS.md`).

**State keys** (all in `localStorage`, except the last): `ict-done`, `ict-quiz`, `ict-exam`, `ict-notes`, `ict-theme`, `ict-sidebar-collapsed` — and `ict-sidebar-scroll` in `sessionStorage`. Resets never clear notes.

---

## ✅ Verification & CI/CD

`verify.mjs` (Node + Playwright) serves the built `dist/` locally and checks — against expectations derived from `content/`, nothing hard-coded — that:

- every lesson page renders and every chart image resolves (no broken figures),
- every quiz renders 4 options, shuffles, grades, and exposes a reset that clears the graded state,
- the lightbox opens, browses the lesson's charts, zooms, and closes on outside click but not on the image,
- review + exam pages render, and the exam scores on submit (full answers → 100% pass) with a working retake,
- a video link renders for each lesson with a non-empty `video.txt`,
- the theme switcher persists, and there are **zero console/page JS errors**.

**CI** (`.github/workflows/ci.yml`) runs on every PR and push to `main`: `pnpm install --frozen-lockfile` → `pnpm check` (lint) → `pnpm build` → install Chromium → `pnpm verify`.

**Deploy** (`.github/workflows/deploy.yml`) publishes `dist/` to **GitHub Pages** via `withastro/action@v6` on every push to `main`. `site` + `base` are set in `astro.config.mjs`, but can be overridden at build time with two environment variables so the same config works on any host:

| Env var | Default (GitHub Pages) | Coolify / root-level host |
|---------|------------------------|---------------------------|
| `SITE_URL` | `https://yousef-diab.github.io` | `https://your-domain` |
| `BASE_PATH` | `/the-algorithm` | `/` |

GitHub Pages and CI use the defaults — no configuration needed. For **Coolify**, no Dockerfile is required: deploy the repo with a **static build** (Coolify/Nixpacks detects Astro automatically) — set the build command to `pnpm install --frozen-lockfile && pnpm build`, the output directory to `dist`, and add the `BASE_PATH=/` environment variable (plus `SITE_URL` if you want canonical URLs pointing at your domain). `pnpm verify` reads `BASE_PATH` too, so verification matches whichever base the site was built with.

Fork testing: `deploy.yml` also reads an optional GitHub repo variable `SITE_URL` (Settings → Secrets and variables → Actions → Variables). A fork can set it to its own Pages URL (e.g. `https://<owner>.github.io`) to build with the correct canonical URL before a PR is merged; unset, it falls back to the default above — no fork-specific domain is hard-coded in the repo.

---

## 🗺️ Roadmap

- [x] Content/rendering split — lessons live in `content/`, assembled by the Astro build.
- [x] AI-development friendly — one obvious edit point per change, an `add-content` skill, and CI-enforced headless verification on every PR.
- [x] **Section 2 — ICT 2022 Mentorship** — all 40 lessons from the episode transcripts and notes, with summary + final exam (see [`docs/s2-2022-mentorship-plan.md`](docs/s2-2022-mentorship-plan.md)).
- [x] Astro 7 migration — multi-page static site, real URLs per lesson, React islands, Tailwind 4 + DaisyUI 5, pnpm tooling.
- [x] **Docs site** — a separate Starlight docs project in `docs/` (own workspace package) documenting every platform process with Mermaid diagrams.
- [ ] A section switcher in the sidebar.

---

## 📄 Documentation

The project's full documentation lives in its own **Starlight docs site** — a completely separate pnpm workspace package under `docs/` that runs independently of the platform (own dev server on port `4322`, own build, never touched by the platform's build or lint). It covers the architecture, every content-authoring workflow, the components, guides and development processes, with Mermaid diagrams.

```bash
pnpm docs:dev       # docs dev server with hot reload → http://localhost:4322
pnpm docs:build     # production build of the docs site → docs/dist/
pnpm docs:preview   # preview the built docs site locally
```

Key docs pages: [Overview](docs/src/content/docs/getting-started/overview.md) · [Project Structure](docs/src/content/docs/architecture/project-structure.md) · [Content Rules](docs/src/content/docs/content/rules.md) · [Add a Lesson](docs/src/content/docs/content/add-lesson.md) · [Keep Docs in Sync](docs/src/content/docs/guides/keep-docs-in-sync.md)

| Doc | What it covers |
|-----|----------------|
| [`docs/src/content/docs/`](docs/src/content/docs/) | The Starlight docs site source (getting-started, architecture, content authoring, components, guides, development) |
| [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) | Working rules and project architecture for AI-assisted development (content principle, conventions, task mapping, verification loop) |
| [`DESIGN.md`](DESIGN.md) | Visual source of truth — design tokens, typography, components |
| [`CHANGELOG.md`](CHANGELOG.md) | Keep-a-changelog history of every change |
| [`docs/content-audit.md`](docs/content-audit.md) | Content audit notes (plain Markdown, kept at the `docs/` root alongside the docs site) |
| [`docs/s2-2022-mentorship-plan.md`](docs/s2-2022-mentorship-plan.md) | Section 2 build plan, episode→lesson map, batching and progress |
| [`docs/s2-2022-mentorship-videos.md`](docs/s2-2022-mentorship-videos.md) | Section 2 source videos |

---

## 🙏 Credits

- **Mentorship notes & charts** — from ICT's (Inner Circle Trader) mentorships.
- **Video transcripts** — original ICT (Inner Circle Trader) mentorship core-content videos.

This project is a personal study aid that reorganises the above material into an interactive format. All credit for the underlying teaching belongs to the original creators.

---

## 👥 Contributors

Thanks to these wonderful people:

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="50%">
        <a href="https://github.com/Yousef-Diab">
          <img src="https://github.com/Yousef-Diab.png" width="100px" alt="Yousef Diab" style="border-radius:50%"/><br />
          <sub><b>Yousef Diab</b></sub>
        </a>
      </td>
      <td align="center" valign="top" width="50%">
        <a href="https://github.com/RitSpunterprise">
          <img src="https://github.com/RitSpunterprise.png" width="100px" alt="Ritspun" style="border-radius:50%"/><br />
          <sub><b>Ritspun</b></sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

---

## 📬 Contact

Questions, corrections, or suggestions? Reach out on Discord: **`.uzex`**

---

## ⚖️ Disclaimer

This project is an **educational study aid only**. It is **not financial advice**, and nothing in it should be taken as a recommendation to buy or sell any financial instrument. Trading involves substantial risk; do your own research and consult a qualified professional before making any investment decisions.
