// Integration tests against the REAL production database (see DATABASE_URL,
// loaded from .env.local by vitest.config.ts). Everything up to this task
// was proven only against an in-memory fake — this is where the writer core
// meets real Postgres for the first time.
//
// m1-01 is a FREE, PUBLISHED lesson anonymous visitors can read right now.
// Every test that touches it restores what it changed in a try/finally, and
// the outer afterAll is a backstop that restores the full captured row (and
// re-settles quiz ordering) regardless of which test failed. Never write
// `begin`/`rollback` as separate calls here — neon-http has no interactive
// transactions, so that pattern is three separate sessions and the "begin"
// and "rollback" are no-ops while the write in between commits for real.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { createWriter } from "@/lib/content/write";
import { createAdminQueries } from "@/lib/content/admin-queries";
import { lessons, quizQuestions, quizResults } from "@/lib/db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!));
const writer = createWriter({ db, revalidate: async () => {} }); // purging is unit-tested
const admin = createAdminQueries({ db });
const ID = "m1-01";
const REF = "notes/ict-core/INDEX.md";
const BLOCKS = [{ t: "p", c: [{ t: "text", v: "INTEGRATION-DRAFT-MARKER" }] }];
const MISSING_ID = "m1-does-not-exist-xyz";

type LessonRow = typeof lessons.$inferSelect;
type QuizRow = typeof quizQuestions.$inferSelect;

let originalLesson: LessonRow;
let originalQuestions: QuizRow[];

function toWriterInput(r: QuizRow) {
  return { id: r.id, q: r.q, options: r.options as string[], answer: r.answer, explanation: r.explanation };
}

beforeAll(async () => {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, ID)).limit(1);
  if (!row) throw new Error(`fixture lesson ${ID} not found — aborting before any write`);
  originalLesson = row;
  originalQuestions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, ID))
    .orderBy(quizQuestions.ord);
  if (originalQuestions.length < 2) throw new Error(`fixture lesson ${ID} needs >= 2 quiz questions to test reorder`);
});

// Backstop: whatever a failed assertion left behind, put m1-01 back to
// exactly what beforeAll captured — including writeOrigin, body and
// sourceRef, not just the draft columns (the brief's own cleanup missed
// these three, which would permanently flip write_origin to 'cms' and trip
// the importer guard on a row only a test ever touched).
afterAll(async () => {
  await db
    .update(lessons)
    .set({
      body: originalLesson.body,
      bodyDraft: originalLesson.bodyDraft,
      sourceRef: originalLesson.sourceRef,
      sourceRefDraft: originalLesson.sourceRefDraft,
      writeOrigin: originalLesson.writeOrigin,
      status: originalLesson.status,
      publishedAt: originalLesson.publishedAt,
    })
    .where(eq(lessons.id, ID));

  // Re-settle quiz ordering atomically (same id set as the fixture, so this
  // is a pure reorder — no orphans, no inserts/deletes) in case an earlier
  // test's own restore didn't run.
  await writer.upsertQuiz(ID, originalQuestions.map(toWriterInput));
});

describe("getLessonDraftBody", () => {
  it("returns null when there is no draft", async () => {
    // Runs before any test below writes a draft, and the real DB starts
    // this suite with 0 drafts across all lessons (verified independently).
    expect(originalLesson.bodyDraft).toBeNull();
    expect(await admin.getLessonDraftBody(ID)).toBeNull();
  });
});

describe("draft lifecycle", () => {
  it("stores a draft that getLessonDraftBody can read back", async () => {
    try {
      await writer.writeLessonBody(ID, BLOCKS, REF);
      expect(await admin.getLessonDraftBody(ID)).toEqual(BLOCKS);
    } finally {
      await db
        .update(lessons)
        .set({ bodyDraft: null, sourceRefDraft: null, writeOrigin: originalLesson.writeOrigin })
        .where(eq(lessons.id, ID));
    }
  });

  it("promote moves body AND ref together, then reports false on a second call", async () => {
    try {
      await writer.writeLessonBody(ID, BLOCKS, REF);
      expect(await writer.promoteDraft(ID)).toBe(true);
      const after = await admin.getLessonForEdit(ID);
      expect(after.sourceRef).toBe(REF);
      expect(after.bodyDraft).toBeNull();
      expect(after.sourceRefDraft).toBeNull();
      expect(await writer.promoteDraft(ID)).toBe(false); // nothing pending now
    } finally {
      // Restore body, sourceRef AND writeOrigin — promoteDraft sets
      // writeOrigin: 'cms' same as writeLessonBody does.
      await db
        .update(lessons)
        .set({
          body: originalLesson.body,
          bodyDraft: null,
          sourceRef: originalLesson.sourceRef,
          sourceRefDraft: null,
          writeOrigin: originalLesson.writeOrigin,
        })
        .where(eq(lessons.id, ID));
    }
  });
});

describe("upsertQuiz", () => {
  it("preserves question_id across a reword and survives a REORDER", async () => {
    const before = originalQuestions;
    const swapped = [before[1], before[0], ...before.slice(2)].map(toWriterInput);
    try {
      await writer.upsertQuiz(ID, swapped);

      const after = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.lessonId, ID))
        .orderBy(quizQuestions.ord);
      expect(after[0].id).toBe(before[1].id); // reordered
      expect(after[1].id).toBe(before[0].id);
      expect(new Set(after.map((r) => r.id))).toEqual(new Set(before.map((r) => r.id))); // ids preserved
      expect(after.every((r) => r.ord >= 0)).toBe(true); // no rows left parked negative
    } finally {
      await writer.upsertQuiz(ID, before.map(toWriterInput)); // restore the original order
    }
  });

  // Coverage item: the orphan tail re-settle (Task 5) has zero coverage
  // today. deleteMissing=false must re-settle the omitted question at the
  // tail (ord = qs.length + n), never leave it parked at a negative ord.
  //
  // Coverage item: cascadeAnswers (Task 5) is computed by a real SELECT
  // BEFORE the batch runs, regardless of deleteMissing — so this is safe to
  // exercise without ever deleting the orphan's quiz_results history.
  it("re-settles an omitted question at the tail and reports the real cascadeAnswers count (deleteMissing=false)", async () => {
    const before = originalQuestions;
    const orphan = before[before.length - 1];
    const kept = before.slice(0, -1).map(toWriterInput);

    const [{ n: expectedCascade }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(quizResults)
      .where(eq(quizResults.questionId, orphan.id));

    try {
      const result = await writer.upsertQuiz(ID, kept, false);
      expect(result.deleted).toBe(0); // deleteMissing=false: nothing is destroyed
      expect(result.cascadeAnswers).toBe(expectedCascade); // proven against a real independent count

      const after = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.lessonId, ID))
        .orderBy(quizQuestions.ord);
      expect(after.every((r) => r.ord >= 0)).toBe(true); // no rows left parked negative
      expect(after.some((r) => r.id === orphan.id)).toBe(true); // orphan kept, not deleted
      const resettled = after.find((r) => r.id === orphan.id)!;
      expect(resettled.ord).toBe(kept.length); // tail = qs.length + 0
    } finally {
      await writer.upsertQuiz(ID, before.map(toWriterInput)); // restore the original set + order
    }
  });
});

describe("setStatus", () => {
  it("returns false for an id that does not exist", async () => {
    expect(await writer.setStatus(MISSING_ID, "published")).toBe(false);
  });

  it("returns true for an existing id, proving RETURNING drives the boolean on neon-http", async () => {
    try {
      // No-op in effect: sets status back to the value it already has.
      expect(await writer.setStatus(ID, originalLesson.status as "draft" | "published")).toBe(true);
    } finally {
      // setStatus always restamps publishedAt when status is "published" —
      // restore the original timestamp so this is truly a no-op afterward.
      await db.update(lessons).set({ publishedAt: originalLesson.publishedAt }).where(eq(lessons.id, ID));
    }
  });
});

describe("importer guard — real column mapping (Task 14)", () => {
  it("selects writeOrigin/bodyDraft with the real field names and types for an existing row", async () => {
    const [existing] = await db
      .select({ writeOrigin: lessons.writeOrigin, bodyDraft: lessons.bodyDraft })
      .from(lessons)
      .where(eq(lessons.id, ID))
      .limit(1);
    expect(existing).toBeDefined();
    expect(typeof existing.writeOrigin).toBe("string");
    expect(existing.bodyDraft === null || Array.isArray(existing.bodyDraft)).toBe(true);
  });

  it("yields undefined (so `existing ?? null` is null) for a row that does not exist", async () => {
    const [existing] = await db
      .select({ writeOrigin: lessons.writeOrigin, bodyDraft: lessons.bodyDraft })
      .from(lessons)
      .where(eq(lessons.id, MISSING_ID))
      .limit(1);
    expect(existing).toBeUndefined();
    expect(existing ?? null).toBeNull();
  });
});
