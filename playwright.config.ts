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
      // Signs in the ADMIN test account once and saves storage state for the
      // "admin" project below. A separate setup project (not "setup" above)
      // because the admin account needs its own credentials and its own
      // storage state file — mixing the two would let a member-only test
      // accidentally run with admin privileges or vice versa. Deliberately
      // NOT a dependency of the default project, so anonymous/member tests
      // still run when E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are absent.
      name: "admin-setup",
      testMatch: /admin\.setup\.ts$/,
    },
    {
      // *.admin.spec.ts files are NOT covered by the .authenticated.spec.ts
      // ignore above — without this second entry, "chromium" would also pick
      // them up and run them anonymously (no storageState), where the
      // admin-only assertions would fail for the wrong reason.
      name: "chromium",
      testIgnore: [/\.authenticated\.spec\.ts$/, /\.admin\.spec\.ts$/],
    },
    {
      // The signed-in half of the gating tests. Depends on "setup" so it
      // only runs (and only needs credentials) when those tests are selected.
      name: "authenticated",
      testMatch: [/\.authenticated\.spec\.ts$/],
      dependencies: ["setup"],
      use: { storageState: "tests/e2e/.auth/user.json" },
    },
    {
      // Task 15's admin escape-hatch review path (draft.admin.spec.ts).
      // Depends on "admin-setup" so it only runs (and only needs admin
      // credentials) when those tests are selected.
      name: "admin",
      testMatch: [/\.admin\.spec\.ts$/],
      dependencies: ["admin-setup"],
      use: { storageState: "tests/e2e/.auth/admin.json" },
    },
  ],
});
