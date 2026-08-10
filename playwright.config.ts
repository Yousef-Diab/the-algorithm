import { defineConfig } from "@playwright/test";

/** Runs the production build and smoke-tests it. `pnpm build` must run first
 *  (CI does; locally webServer will reuse a running `pnpm start`). */
export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
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
});
