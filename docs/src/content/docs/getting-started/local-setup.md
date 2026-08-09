---
title: Local Setup
description: Prerequisites, installation, and the commands to run the platform and the docs site locally.
---

Getting the project running locally takes a few minutes. You need **Node.js**
and **pnpm** — nothing else. No runtime dependencies, no database, no external
services.

## Prerequisites

| Tool | Minimum version | Notes |
| --- | --- | --- |
| Node.js | `>= 22.12.0` | Checked by the root `package.json` `engines` field. The repo pins `.node-version` to 24. |
| pnpm | 9.x or newer (11.x recommended) | The project relies on pnpm workspaces and lockfile semantics. |

:::note
Older pnpm versions (9.x, used by Nixpacks) are supported: the
`pnpm-workspace.yaml` file keeps the project in workspace mode for them, and
`allowBuilds` only matters for pnpm 10/11.
:::

## Install

From the repository root:

```bash
pnpm install
```

This installs **both workspace packages** — the platform (`.`) and the docs
(`docs`) — into one shared `node_modules` and writes the lockfile
(`pnpm-lock.yaml`). CI uses `pnpm install --frozen-lockfile`, so the lockfile
must always be committed whenever dependencies change.

One-time setup for verification (only needed once per machine):

```bash
pnpm exec playwright install chromium
```

## Run the platform

```bash
pnpm dev
```

- Runs `scripts/sync-images.mjs` first (mirrors `images/` into `public/images/`).
- Starts the Astro dev server with hot module replacement.
- The platform is served at **http://localhost:4321**.

## Run the docs site

```bash
pnpm docs:dev
```

- Starts the Starlight documentation site at **http://localhost:4322**
  (the port is set in `docs/package.json`).
- It is a completely separate Astro project inside the `docs/` workspace
  package — it does not touch the platform's dev server.

You can run both at the same time and edit content in `src/`, `content/`,
`images/`, or `docs/src/content/docs/` while watching the results live.

## Build and verify

```bash
pnpm build    # sync images → astro build → dist/
pnpm verify   # headless end-to-end checks against the existing dist/
```

`pnpm build` must complete **before** `pnpm verify` — verification runs
against the built output. See [Verification](/development/verification) for
what it checks.

## Other useful commands

| Command | Purpose |
| --- | --- |
| `pnpm preview` | Serve the built `dist/` locally (after `pnpm build`). |
| `pnpm docs:build` | Build the docs site into `docs/dist/`. |
| `pnpm docs:preview` | Serve the built docs locally on port 4322. |
| `pnpm check` | Lint + format check (exactly what CI runs). |
| `pnpm typecheck` | Run `astro check` (type-checking of Astro + TS files). |
| `pnpm fix` | Auto-fix everything Biome considers safe. |

:::caution
Never run `pnpm fix` while `assist.actions.source.organizeImports` is enabled
for `.astro` files — Biome cannot see component usage in `.astro` templates
and deletes frontmatter imports. The config already keeps it off for `*.astro`;
see [Lint & Format](/development/lint-format).
:::

## Troubleshooting

- **`pnpm verify` fails after a fresh build** — make sure `pnpm build` ran
  without errors first; `verify` serves whatever is in `dist/`.
- **Port 4321/4322 already in use** — stop the other dev server, or pass a
  different port (e.g. `pnpm dev --port 4323`).
- **Lockfile mismatch in CI** — after changing dependencies, commit the
  regenerated `pnpm-lock.yaml` (`pnpm install` does this).
- **Charts missing in dev** — the `predev`/`prebuild` scripts run
  `sync-images.mjs`; if you bypass them (`pnpm astro dev`), run
  `node scripts/sync-images.mjs` manually.
