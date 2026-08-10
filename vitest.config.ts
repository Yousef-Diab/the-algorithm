import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Dummy, non-secret placeholder so files that import lib/db (which throws
    // at module-load time without DATABASE_URL) can be imported under Vitest,
    // e.g. to unit-test a pure function that lives alongside cached DB
    // queries. No test in this suite actually connects to a database.
    env: { DATABASE_URL: "postgres://user:pass@localhost:5432/vitest-placeholder" },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "server-only": resolve(__dirname, "tests/unit/stubs/server-only.ts"),
    },
  },
});
