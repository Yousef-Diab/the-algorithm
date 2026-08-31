import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

/**
 * SEPARATE from vitest.config.ts on purpose. The integration suite talks to the
 * REAL database (lib/content/write.ts against Neon) and mutates m1-01, a free,
 * published lesson. While `include` covered both directories, a bare
 * `pnpm exec vitest`, watch mode, or an editor's test-runner plugin — none of
 * which go through the `test:unit` script — silently ran those writes against
 * production. The default config is now unit-only, and reaching the DB requires
 * naming this file: `pnpm test:integration`.
 *
 * Vitest is a separate process from Next, so this needs DATABASE_URL in ITS OWN
 * env — mirrors playwright.config.ts:7, which loads .env.local for the same
 * reason. There is deliberately NO placeholder fallback here: an integration
 * run with no real DATABASE_URL should fail loudly, not connect to a fiction.
 */
loadEnv({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.{ts,tsx}"],
    // ONE FILE AT A TIME. Every file here writes to the same real database,
    // and more than one targets the same fixture lesson (m1-01): write-db
    // rewords and adds questions to its quiz, import-db re-imports it and
    // asserts its question ids are untouched. Run in parallel — Vitest's
    // default across files — each file's beforeAll snapshot is invalidated
    // by the other file's writes mid-run, and the failure looks like a bug
    // in the code under test rather than a test collision.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      // lib/db/index.ts:1 is `import "server-only"`, a package that is NOT
      // installed; Next aliases it at build time, so Vitest must too.
      "server-only": resolve(__dirname, "tests/unit/stubs/server-only.ts"),
    },
  },
});
