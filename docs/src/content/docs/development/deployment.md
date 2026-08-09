---
title: Deployment
description: How the site is deployed to GitHub Pages, and how to deploy the same static build to a root-level host like Coolify.
---

The platform is a **static Astro build** — `dist/` is plain HTML/CSS/JS with
no runtime dependencies and no external requests. That makes it deployable
anywhere a static site can live.

## GitHub Pages (primary)

The site publishes at **https://yousef-diab.github.io/the-algorithm/** from
`main` via the `deploy.yml` workflow (`withastro/action@v6`).

- `site` = `https://yousef-diab.github.io`
- `base` = `/the-algorithm` (the project-site path)

Both come from `astro.config.mjs` and can be overridden at build time:

| Variable | Overrides | Example |
| --- | --- | --- |
| `SITE_URL` | the canonical `site` | `SITE_URL=https://docs.example.com` |
| `BASE_PATH` | the base path | `BASE_PATH=/` for a root-level host |

## Root-level hosts (Coolify, Vercel, Netlify, nginx…)

The same build deploys to any host that serves a static directory. Deploy
`dist/` as the output directory and set the base path to the root:

```bash
BASE_PATH=/ pnpm build
```

Notes:

- With `BASE_PATH=""` (or `/`), all internal links resolve at the domain root,
  thanks to the `u()` base-URL helper (`src/lib/course.ts`).
- **Never hard-code `/the-algorithm`** in links or assets — always use `u()`.
- A static build needs no server, no environment at runtime, and no
  database — just the files in `dist/`.

## Deploying the docs site

The docs project (`docs/`) is a separate static build:

```bash
pnpm docs:build    # → docs/dist/
```

You can host `docs/dist/` the same way (GitHub Pages sub-path, Coolify
service, etc.). The docs are self-contained and offline-capable (Mermaid
diagrams render client-side).

## Deploy checklist

- [ ] `pnpm build` passes locally.
- [ ] `pnpm verify` passes locally.
- [ ] Base path matches the target host (`/the-algorithm` for the GitHub
      Pages site, `/` for root hosts).
- [ ] Push to `main` only when explicitly asked (deploy runs from `main`).
