import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Falls back to a dummy, non-secret placeholder ONLY when DATABASE_URL is
    // unset, so files that import lib/db (which throws at module-load time
    // without it) can be imported under Vitest — e.g. to unit-test a pure
    // function that lives alongside cached DB queries — without breaking
    // tests that never connect. A real DATABASE_URL (e.g. from
    // --env-file=.env.local) passes through untouched, so DB-backed tests
    // still reach the real database.
    env: { DATABASE_URL: process.env.DATABASE_URL ?? "postgres://user:pass@localhost:5432/vitest-placeholder" },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "server-only": resolve(__dirname, "tests/unit/stubs/server-only.ts"),
    },
  },
});
