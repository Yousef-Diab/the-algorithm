---
title: Scripts Reference
description: Every npm script in the root and docs packages — what it does and when to use it.
---

All scripts are run from the repository root with pnpm. The platform scripts
live in the root `package.json`; the docs scripts live in `docs/package.json`
and are reachable through `pnpm docs:*` wrappers.

## Platform scripts (root)

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `pnpm dev` | Runs `predev` (`sync-images.mjs`), then the Astro dev server with HMR at http://localhost:4321. |
| `build` | `pnpm build` | Runs `prebuild` (`sync-images.mjs`), then `astro build` → `dist/`. |
| `preview` | `pnpm preview` | Serves the built `dist/` locally (after `pnpm build`). |
| `verify` | `pnpm verify` | Headless end-to-end checks against the existing `dist/` (Node + Playwright). **Run after `pnpm build`.** |
| `check` | `pnpm check` | Lint + format check (Ultracite + Biome) — exactly what CI runs. |
| `fix` | `pnpm fix` | Auto-fix everything Biome considers safe. ⚠️ See [Lint & Format](/development/lint-format). |
| `typecheck` | `pnpm typecheck` | `astro check` — type-checks Astro + TS files. |
| `astro` | `pnpm astro …` | Passthrough to the Astro CLI (e.g. `pnpm astro add …`). |
| `predev` / `prebuild` | — | Hooks that run `node scripts/sync-images.mjs` automatically. |

## Docs scripts (workspace)

| Script | Command | What it does |
| --- | --- | --- |
| `docs:dev` | `pnpm docs:dev` | `pnpm --filter docs dev` → Starlight dev server at http://localhost:4322. |
| `docs:build` | `pnpm docs:build` | `pnpm --filter docs build` → `docs/dist/`. |
| `docs:preview` | `pnpm docs:preview` | Serves the built docs at http://localhost:4322. |

Or run them directly inside `docs/`:

```bash
pnpm --filter docs build
```

## Scripts to avoid running directly

| Command | Why |
| --- | --- |
| `pnpm astro dev` / `pnpm astro build` (root) | Bypasses the `predev`/`prebuild` hooks — charts won't be synced. Use `pnpm dev` / `pnpm build`. |
| `python build.py` / `python verify.py` | Legacy Python build — obsolete. Never run. |
| Legacy `engine/`, `index.html` | Obsolete; never edit or run. |

## Environment variables

| Variable | Used by | Effect |
| --- | --- | --- |
| `SITE_URL` | root `astro.config.mjs` | Overrides the canonical site URL (default: GitHub Pages URL). |
| `BASE_PATH` | root `astro.config.mjs` | Overrides the base path (`''` → `/`, e.g. for Coolify). |

See [Build System](/architecture/build-system).
