// @ts-check

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// GitHub Pages serves this repo at https://<owner>.github.io/the-algorithm/,
// so `site` + `base` must be set for every generated URL to resolve.
export default defineConfig({
  base: "/the-algorithm",
  integrations: [react()],
  site: "https://ritspunterprise.github.io",
  vite: {
    plugins: [tailwindcss()],
  },
});
