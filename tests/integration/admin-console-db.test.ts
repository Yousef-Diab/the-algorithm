import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { lessons } from "@/lib/db/schema";
import { createWriter } from "@/lib/content/write";

const ID = "m1-01";
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
const writer = createWriter({ db, revalidate: async () => {} });

type Snapshot = {
  body: unknown;
  bodyDraft: unknown;
  sourceRef: string | null;
  sourceRefDraft: string | null;
  writeOrigin: string;
};
let snapshot: Snapshot;

async function readRow(): Promise<Snapshot> {
  const [row] = await db
    .select({
      body: lessons.body,
      bodyDraft: lessons.bodyDraft,
      sourceRef: lessons.sourceRef,
      sourceRefDraft: lessons.sourceRefDraft,
      writeOrigin: lessons.writeOrigin,
    })
    .from(lessons)
    .where(eq(lessons.id, ID));
  return row as Snapshot;
}

/** Byte-exact restore. Counts cannot see a rewritten row; this can. */
async function restore(): Promise<void> {
  await db
    .update(lessons)
    .set({
      body: snapshot.body,
      bodyDraft: snapshot.bodyDraft,
      sourceRef: snapshot.sourceRef,
      sourceRefDraft: snapshot.sourceRefDraft,
      writeOrigin: snapshot.writeOrigin,
    })
    .where(eq(lessons.id, ID));
  await sql`delete from admin_actions where lesson_id = ${ID}`;
}

beforeAll(async () => {
  snapshot = await readRow();
  expect(snapshot.bodyDraft, "m1-01 must start with no pending draft").toBeNull();
});

afterAll(restore);

describe("discardLessonDraft against real Postgres", () => {
  it("clears body_draft AND source_ref_draft together, leaving the live body untouched", async () => {
    try {
      await writer.writeLessonBody(
        ID,
        [{ t: "p", c: [{ t: "text", v: "throwaway draft" }] }],
        "notes/ict-core/INDEX.md",
      );
      const planted = await readRow();
      expect(planted.bodyDraft).not.toBeNull();
      expect(planted.sourceRefDraft).toBe("notes/ict-core/INDEX.md");

      // The WRITER is exercised directly, NOT lib/content/mutations.ts. That
      // module is "use server" and imports next/cache; pulling it into a plain
      // Vitest process is a different failure class entirely. Its authorization
      // half is covered by tests/unit/admin-mutations.test.ts and by the Task 15
      // mutation test — this file's job is the DB behaviour.
      const ok = await writer.discardDraft(ID);
      expect(ok).toBe(true);

      const after = await readRow();
      expect(after.bodyDraft).toBeNull();
      expect(after.sourceRefDraft).toBeNull();
      expect(JSON.stringify(after.body)).toBe(JSON.stringify(snapshot.body));
    } finally {
      await restore();
    }
  });

  it("returns false when there is no draft to discard", async () => {
    expect(await writer.discardDraft(ID)).toBe(false);
  });
});

describe("the audit record", () => {
  it("writes the row and never stores body content", async () => {
    try {
      const { recordAdminAction } = await import("@/lib/admin/audit");
      await recordAdminAction({
        actorUserId: "integration-test-actor",
        action: "promote",
        lessonId: ID,
        outcome: "ok",
        detail: { fingerprint: "deadbeef" },
      });
      const rows = await sql`select action, outcome, lesson_id, detail from admin_actions where lesson_id = ${ID}`;
      expect(rows).toHaveLength(1);
      expect(rows[0].action).toBe("promote");
      expect(rows[0].outcome).toBe("ok");
      const detail = JSON.stringify(rows[0].detail);
      expect(detail).toContain("deadbeef");
      // Invariant 6: the audit table must not become a second copy of prose.
      expect(detail).not.toMatch(/"t"\s*:\s*"p"/);
      expect(detail).not.toContain("throwaway draft");
    } finally {
      await sql`delete from admin_actions where lesson_id = ${ID}`;
    }
  });
});
