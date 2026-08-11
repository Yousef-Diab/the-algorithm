import { neon } from "@neondatabase/serverless";

/**
 * Reads the published lesson catalog straight from Postgres for the
 * all-lessons sweep. Deliberately does NOT import lib/content/queries.ts —
 * that module is FROZEN, carries `import "server-only"` and next/cache, and
 * will not resolve under the Playwright test runner process.
 *
 * playwright.config.ts already calls loadEnv({ path: ".env.local" }) before
 * defineConfig runs, so process.env.DATABASE_URL is populated here too.
 */
export interface CatalogRow {
  id: string;
  kind: string;
  access: string;
  videoUrl: string | null;
}

const EXPECTED_ROW_COUNT = 82;

export async function catalogRows(): Promise<CatalogRow[]> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — see .env.local");
  const sql = neon(url);

  const rows = (await sql`
    select id, kind, access, video_url
    from lessons
    where status = 'published'
    order by section_id, ord
  `) as { id: string; kind: string; access: string; video_url: string | null }[];

  if (rows.length !== EXPECTED_ROW_COUNT) {
    throw new Error(
      `catalogRows(): expected ${EXPECTED_ROW_COUNT} published lessons, got ${rows.length}. ` +
        "A sweep over the wrong count would pass vacuously if it silently shrank, so this fails loudly instead.",
    );
  }

  return rows.map((r) => ({ id: r.id, kind: r.kind, access: r.access, videoUrl: r.video_url }));
}
