import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

// THE DEFAULT CONFIG IS UNIT-ONLY, and deliberately so: tests/integration
// writes to the REAL database, and while `include` covered it too, a bare
// `pnpm exec vitest`, watch mode, or an editor plugin — none of which go
// through the `test:unit` script — mutated production content with no
// confirmation. The integration suite now lives behind its own config and its
// own script (`pnpm test:integration` → vitest.integration.config.ts).
//
// .env.local is still loaded because a few unit tests read env, and because
// keeping the two configs' env handling identical avoids a surprise if a test
// moves between them. If .env.local is absent, loadEnv finds nothing and the
// placeholder fallback below applies, so `pnpm test:unit` keeps running with
// DATABASE_URL unset — see the comment on that fallback.
loadEnv({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
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
