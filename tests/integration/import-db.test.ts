// Integration tests against the REAL production database (see DATABASE_URL,
// loaded from .env.local by vitest.integration.config.ts).
//
// These cover the importer's quiz write, which used to delete every
// quiz_questions row for a lesson and re-insert it, regenerating every
// question_id. quiz_results references quiz_questions.id with
// onDelete: cascade and has NO lesson column, so that wholesale swap silently
// destroyed every saved user answer for the lesson.
//
// Test 1 runs the REAL script (scripts/import-content.mjs --only m1-01) as a
// child process — the highest-fidelity check available, since the bug lived in
// the script, not in a library. m1-01 is a free, published lesson; an import of
// unchanged content must be a genuine no-op for its question ids.
//
// Test 2 needs an add/remove/reorder, which would permanently change a real
// lesson's ids, so it builds a THROWAWAY lesson and deletes it afterwards.
// Never write `begin`/`rollback` as separate calls here — neon-http has no
// interactive transactions, so that pattern is three separate sessions and the
// "begin" and "rollback" are no-ops while the write in between commits.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { and, eq, inArray } from "drizzle-orm";
import { createWriter } from "@/lib/content/write";
import { matchQuestionIds } from "@/lib/content/import";
import type { PlannedQuestion } from "@/lib/content/import";
import { lessons, quizQuestions, quizResults } from "@/lib/db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!));
const writer = createWriter({ db, revalidate: async () => {} });

const ID = "m1-01";
const TEST_USER = "importer-test-user"; // quiz_results.user_id is plain text, no FK
const TEMP_LESSON = "importer-test-lesson";

type QuizRow = typeof quizQuestions.$inferSelect;

/**
 * The importer's quiz path, exactly as scripts/import-content.mjs runs it:
 * read the lesson's existing ids, match them onto the id-less questions parsed
 * from content/, upsert with deleteMissing.
 */
async function importQuizPath(lessonId: string, questions: PlannedQuestion[]) {
  const existing = await db
    .select({ id: quizQuestions.id, q: quizQuestions.q })
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .orderBy(quizQuestions.ord);
  return writer.upsertQuiz(lessonId, matchQuestionIds(existing, questions), true);
}

const readQuiz = (lessonId: string): Promise<QuizRow[]> =>
  db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, lessonId)).orderBy(quizQuestions.ord);

const planned = (n: number, over: Partial<PlannedQuestion> = {}): PlannedQuestion => ({
  ord: n,
  q: `temp question ${n}?`,
  options: ["a", "b", "c", "d"],
  answer: 0,
  explanation: `temp explanation ${n}`,
  ...over,
});

let originalQuestions: QuizRow[];

beforeAll(async () => {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, ID)).limit(1);
  if (!row) throw new Error(`fixture lesson ${ID} not found — aborting before any write`);
  originalQuestions = await readQuiz(ID);
  if (originalQuestions.length < 2) throw new Error(`fixture lesson ${ID} needs >= 2 quiz questions`);

  // Leave nothing behind from an earlier interrupted run.
  await db.delete(quizResults).where(eq(quizResults.userId, TEST_USER));
  await db.delete(lessons).where(eq(lessons.id, TEMP_LESSON));
});

// Backstop for whatever a failed assertion left behind.
afterAll(async () => {
  await db.delete(quizResults).where(eq(quizResults.userId, TEST_USER));
  await db.delete(lessons).where(eq(lessons.id, TEMP_LESSON)); // quiz_questions cascade
});

describe("pnpm content:import re-importing unchanged content", () => {
  it("preserves every question_id and every saved answer", async () => {
    // Seed a saved answer against a real question, exactly as a user would.
    const target = originalQuestions[0];
    await db.insert(quizResults).values({
      userId: TEST_USER,
      questionId: target.id,
      selected: target.answer,
      correct: true,
    });

    try {
      // The real script, against the real content/ tree, for this one lesson.
      execFileSync(
        process.execPath,
        ["--experimental-strip-types", "scripts/import-content.mjs", "--only", ID],
        { stdio: "pipe", env: process.env },
      );

      const after = await readQuiz(ID);
      expect(after.map((r) => r.id)).toEqual(originalQuestions.map((r) => r.id));
      expect(after.map((r) => r.ord)).toEqual(originalQuestions.map((r) => r.ord));
      expect(after.map((r) => r.q)).toEqual(originalQuestions.map((r) => r.q));

      // THE ASSERTION THAT MATTERS: the user data the old delete-and-reinsert
      // destroyed. Under the bug this row is gone, cascaded away.
      const saved = await db
        .select()
        .from(quizResults)
        .where(and(eq(quizResults.userId, TEST_USER), eq(quizResults.questionId, target.id)));
      expect(saved).toHaveLength(1);
      expect(saved[0].selected).toBe(target.answer);
    } finally {
      await db.delete(quizResults).where(eq(quizResults.userId, TEST_USER));
    }
  }, 120_000);
});

describe("importing a genuinely changed quiz", () => {
  it("keeps surviving ids and leaves ords gapless from 0", async () => {
    // A throwaway lesson, so an add/remove/reorder cannot perturb real content.
    await db.insert(lessons).values({
      id: TEMP_LESSON,
      sectionId: "s1",
      monthId: "m1",
      slug: `${TEMP_LESSON}-slug`,
      title: "Importer Test Lesson",
      heading: "Importer Test Lesson",
      crumb: "Test",
      desc: [],
      ord: 9001,
      kind: "lesson",
      access: "admin",
      status: "draft",
      body: [],
      writeOrigin: "import",
    });

    try {
      // First import: three questions, all new.
      await importQuizPath(TEMP_LESSON, [planned(0), planned(1), planned(2)]);
      const first = await readQuiz(TEMP_LESSON);
      expect(first.map((r) => r.q)).toEqual(["temp question 0?", "temp question 1?", "temp question 2?"]);
      const idOf = new Map(first.map((r) => [r.q, r.id]));

      // Second import: question 1 REMOVED, 0 and 2 REORDERED, a new one ADDED.
      const stats = await importQuizPath(TEMP_LESSON, [planned(2), planned(3), planned(0)]);
      expect(stats.deleted).toBe(1);

      const second = await readQuiz(TEMP_LESSON);
      expect(second.map((r) => r.q)).toEqual(["temp question 2?", "temp question 3?", "temp question 0?"]);

      // Survivors keep the ids they were born with, tracking their TEXT
      // through the reorder rather than their position.
      expect(second[0].id).toBe(idOf.get("temp question 2?"));
      expect(second[2].id).toBe(idOf.get("temp question 0?"));
      // The added question is genuinely new.
      expect(second[1].id).not.toBe(idOf.get("temp question 1?"));

      // The removed question's row is gone, not parked.
      const removedId = idOf.get("temp question 1?")!;
      expect(await db.select().from(quizQuestions).where(eq(quizQuestions.id, removedId))).toHaveLength(0);

      // Ords settled out of the negative park: gapless, from 0, no duplicates.
      expect(second.map((r) => r.ord)).toEqual([0, 1, 2]);
    } finally {
      await db.delete(lessons).where(eq(lessons.id, TEMP_LESSON));
    }
  }, 60_000);

  it("cascades saved answers only for a question actually removed", async () => {
    await db.insert(lessons).values({
      id: TEMP_LESSON,
      sectionId: "s1",
      monthId: "m1",
      slug: `${TEMP_LESSON}-slug`,
      title: "Importer Test Lesson",
      heading: "Importer Test Lesson",
      crumb: "Test",
      desc: [],
      ord: 9001,
      kind: "lesson",
      access: "admin",
      status: "draft",
      body: [],
      writeOrigin: "import",
    });

    try {
      await importQuizPath(TEMP_LESSON, [planned(0), planned(1)]);
      const rows = await readQuiz(TEMP_LESSON);
      await db.insert(quizResults).values(
        rows.map((r) => ({ userId: TEST_USER, questionId: r.id, selected: 0, correct: true })),
      );

      // Drop question 1 only.
      const stats = await importQuizPath(TEMP_LESSON, [planned(0)]);
      expect(stats.cascadeAnswers).toBe(1);

      const kept = await db
        .select()
        .from(quizResults)
        .where(inArray(quizResults.questionId, rows.map((r) => r.id)));
      expect(kept).toHaveLength(1);
      expect(kept[0].questionId).toBe(rows[0].id);
    } finally {
      await db.delete(quizResults).where(eq(quizResults.userId, TEST_USER));
      await db.delete(lessons).where(eq(lessons.id, TEMP_LESSON));
    }
  }, 60_000);
});
