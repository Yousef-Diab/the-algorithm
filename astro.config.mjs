// @ts-check

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Deployment is env-driven so the same config works on both hosts:
//   - GitHub Pages (default): serves this repo at
//     https://yousef-diab.github.io/the-algorithm/, so `site` + `base` are
//     set here to match. Every generated URL then resolves. A GitHub repo
//     variable named SITE_URL overrides the canonical URL (e.g. when testing
//     the fork before the PR is merged).
//   - Coolify (or any root-level host): build with `BASE_PATH=/` (and
//     optionally `SITE_URL=https://your-domain`) so assets resolve from the
//     domain root — serve the static `dist/` output directly.
// `||` (not `??`) so an empty SITE_URL — what an unset GitHub repo variable
// expands to — falls back to the GitHub Pages default.
const site = process.env.SITE_URL || "https://yousef-diab.github.io";
const rawBase = process.env.BASE_PATH ?? "/the-algorithm";
const base = rawBase === "" ? "/" : rawBase;

export default defineConfig({
  base,
  integrations: [react()],
  // Explicit static output: no adapter, no SSR — pure prerendered site.
  output: "static",
  site,
  vite: {
    plugins: [tailwindcss()],
  },
});
