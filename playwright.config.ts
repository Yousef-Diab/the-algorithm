import { config as loadEnv } from "dotenv";
import { defineConfig } from "@playwright/test";

// The Next.js server (webServer below) loads .env.local on its own, but the
// Playwright test runner is a separate process — it needs E2E_EMAIL /
// E2E_PASSWORD in ITS OWN env to hand to auth.setup.ts.
loadEnv({ path: ".env.local" });

/** Runs the production build and smoke-tests it. `pnpm build` must run first
 *  (CI does; locally webServer will reuse a running `pnpm start`). */
export default defineConfig({
  // Scoped to tests/e2e, NOT tests/ with a testIgnore for **/unit/**: a
  // project-level `testIgnore` REPLACES the top-level one rather than merging
  // with it, so the "chromium" project's own ignore silently un-ignored the
  // Vitest suite and `pnpm test:e2e` died on "Vitest cannot be imported in a
  // CommonJS module". `testDir` is inherited by every project below (none
  // override it), so the unit tests are structurally out of reach.
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      // Signs in through the real UI once and saves storage state for the
      // "authenticated" project below. Deliberately NOT a dependency of the
      // default project, so anonymous gating tests still run when
      // E2E_EMAIL / E2E_PASSWORD are absent — only the signed-in half of the
      // gating suite needs this to have succeeded.
      name: "setup",
      testMatch: /auth\.setup\.ts$/,
    },
    {
      name: "chromium",
      testIgnore: [/\.authenticated\.spec\.ts$/],
    },
    {
      // The signed-in half of the gating tests. Depends on "setup" so it
      // only runs (and only needs credentials) when those tests are selected.
      name: "authenticated",
      testMatch: [/\.authenticated\.spec\.ts$/],
      dependencies: ["setup"],
      use: { storageState: "tests/e2e/.auth/user.json" },
    },
  ],
});
