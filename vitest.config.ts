import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

// Vitest is a separate process from Next, so tests/integration (which talks
// to the real database via lib/content/write.ts) needs DATABASE_URL in ITS
// OWN env — mirrors playwright.config.ts:7, which loads .env.local for the
// same reason. If .env.local is absent, loadEnv finds nothing and the
// placeholder fallback below still applies, so `pnpm test:unit` keeps
// running with DATABASE_URL unset — see the comment on that fallback.
loadEnv({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    // Falls back to a dummy, non-secret placeholder ONLY when DATABASE_URL is
    // unset, so files that import lib/db (which throws at module-load time
    // without it) can be imported under Vitest — e.g. to unit-test a pure
    // function that lives alongside cached DB queries — without breaking
    // tests that never connect. A real DATABASE_URL (e.g. from
    // --env-file=.env.local, or loaded above from .env.local) passes through
    // untouched, so DB-backed tests still reach the real database.
    env: { DATABASE_URL: process.env.DATABASE_URL ?? "postgres://user:pass@localhost:5432/vitest-placeholder" },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "server-only": resolve(__dirname, "tests/unit/stubs/server-only.ts"),
    },
  },
});
