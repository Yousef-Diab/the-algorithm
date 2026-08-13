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

/**
 * A real media id belonging to a published, access='members' lesson — for
 * asserting that a members lesson's charts 404 for an anonymous request.
 * Throws loudly if none exists so this can never silently pass vacuously.
 */
export async function gatedMediaId(): Promise<string> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — see .env.local");
  const sql = neon(url);

  const rows = (await sql`
    select media.id
    from media
    join lessons on lessons.id = media.lesson_id
    where lessons.access = 'members' and lessons.status = 'published'
    limit 1
  `) as { id: string }[];

  if (rows.length === 0) {
    throw new Error(
      "gatedMediaId(): no media row found for a published, access='members' lesson — " +
        "the gating test would pass vacuously without one.",
    );
  }

  return rows[0].id;
}

/** Plants a draft body out-of-band. The e2e account is a MEMBER, not an admin,
 *  so the draft cannot be created through the UI — and must not be. */
export async function plantDraft(lessonId: string, marker: string): Promise<() => Promise<void>> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — see .env.local");
  const sql = neon(url);
  const blocks = JSON.stringify([{ t: "p", c: [{ t: "text", v: marker }] }]);
  await sql`update lessons set body_draft = ${blocks}::jsonb, source_ref_draft = 'notes/ict-core/INDEX.md' where id = ${lessonId}`;
  return async () => {
    await sql`update lessons set body_draft = null, source_ref_draft = null where id = ${lessonId}`;
  };
}

/**
 * Unmistakable id/slug so this can never collide with real content.
 * `lessons.slug` carries a unique index, so both must be distinct too.
 */
const DRAFT_PROBE_ID = "e2e-draft-probe";
const DRAFT_PROBE_SLUG = "e2e-draft-probe-do-not-use";

/**
 * Creates a dedicated, throwaway lesson row with status='draft' — Task 15's
 * guard keys on `status`, not on the presence of `body_draft`, so a spec
 * probing that guard needs a row that is actually unpublished, not merely one
 * carrying draft prose. A real lesson's status is NEVER flipped for this:
 * playwright.config.ts runs fullyParallel, and all-lessons.authenticated.spec.ts
 * sweeps the published catalog concurrently — unpublishing a real row mid-run
 * would race it. This row is `status='draft'` from creation, so
 * `catalogRows()`'s `where status = 'published'` filter never sees it.
 */
export async function plantDraftLessonRow(): Promise<{ id: string; cleanup: () => Promise<void> }> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — see .env.local");
  const sql = neon(url);

  await sql`
    insert into lessons (id, section_id, month_id, slug, title, heading, crumb, ord, kind, access, status)
    values (
      ${DRAFT_PROBE_ID}, 's1', null, ${DRAFT_PROBE_SLUG},
      'E2E Draft Probe (throwaway)', 'E2E Draft Probe', 'E2E · Draft Probe',
      999999, 'lesson', 'free', 'draft'
    )
  `;

  return {
    id: DRAFT_PROBE_ID,
    cleanup: async () => {
      await sql`delete from lessons where id = ${DRAFT_PROBE_ID}`;
    },
  };
}

/**
 * Own id/slug, distinct from DRAFT_PROBE_ID/SLUG above — `lessons.slug` has a
 * unique index, and a second probe row concurrent with the first (both specs
 * can run in the same fullyParallel worker set) must not collide with it.
 */
const EXAM_DRAFT_PROBE_ID = "e2e-exam-draft-probe";
const EXAM_DRAFT_PROBE_SLUG = "e2e-exam-draft-probe-do-not-use";

/**
 * Same shape as plantDraftLessonRow, but kind='exam'. Task 15 put the
 * IDENTICAL draft guard in app/api/exam/[id]/route.ts, gated behind an EARLIER
 * guard specific to that route (`meta.kind !== "exam"` → 404, checked first).
 * A probe with kind='lesson' would 404 there for the wrong reason (kind
 * mismatch) even with no draft guard at all — so proving the exam route's
 * draft guard requires a row that actually IS kind='exam', or the kind guard
 * masks whatever the status guard would have done. Never created as
 * status='published': a published row becomes visible to catalogRows()'s
 * `where status = 'published'` filter, which hard-codes EXPECTED_ROW_COUNT
 * and throws on mismatch, and playwright.config.ts runs fullyParallel — a
 * momentarily-published probe could race all-lessons.authenticated.spec.ts's
 * catalog sweep. So this row is status='draft' from creation to deletion,
 * exactly like plantDraftLessonRow.
 */
export async function plantDraftExamRow(): Promise<{ id: string; cleanup: () => Promise<void> }> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — see .env.local");
  const sql = neon(url);

  await sql`
    insert into lessons (id, section_id, month_id, slug, title, heading, crumb, ord, kind, access, status)
    values (
      ${EXAM_DRAFT_PROBE_ID}, 's1', null, ${EXAM_DRAFT_PROBE_SLUG},
      'E2E Exam Draft Probe (throwaway)', 'E2E Exam Draft Probe', 'E2E · Exam Draft Probe',
      999999, 'exam', 'free', 'draft'
    )
  `;

  return {
    id: EXAM_DRAFT_PROBE_ID,
    cleanup: async () => {
      await sql`delete from lessons where id = ${EXAM_DRAFT_PROBE_ID}`;
    },
  };
}
