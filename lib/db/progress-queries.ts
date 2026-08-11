import "server-only";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "./index";
import { progress, quizResults, quizQuestions, lessons } from "./schema";
import type { MergePlan } from "./merge-local";

// Re-exported so the plan's stated interface (`planMerge` reachable from
// progress-queries) holds. The implementation stays in merge-local.ts, which
// keeps zero imports.
export { planMerge } from "./merge-local";
export type { LocalState, ServerState, MergePlan } from "./merge-local";

/** The user's completed lesson ids. */
export async function getUserProgress(userId: string): Promise<string[]> {
  const rows = await db
    .select({ lessonId: progress.lessonId })
    .from(progress)
    .where(eq(progress.userId, userId));
  return rows.map((r) => r.lessonId);
}

/** Marks (or unmarks) a lesson done for a user. */
export async function setProgress(userId: string, lessonId: string, done: boolean): Promise<void> {
  if (done) {
    await db.insert(progress).values({ userId, lessonId }).onConflictDoNothing();
  } else {
    await db
      .delete(progress)
      .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));
  }
}

/** The user's graded answers for one lesson, keyed by question uuid. */
export async function getQuizAnswers(
  userId: string,
  lessonId: string,
): Promise<Record<string, { selected: number; correct: boolean }>> {
  const rows = await db
    .select({
      questionId: quizResults.questionId,
      selected: quizResults.selected,
      correct: quizResults.correct,
    })
    .from(quizResults)
    .innerJoin(quizQuestions, eq(quizResults.questionId, quizQuestions.id))
    .where(and(eq(quizResults.userId, userId), eq(quizQuestions.lessonId, lessonId)));

  const out: Record<string, { selected: number; correct: boolean }> = {};
  for (const r of rows) out[r.questionId] = { selected: r.selected, correct: r.correct };
  return out;
}

/**
 * Looks up the question's answer itself and computes `correct` server-side —
 * the client's own claim is never trusted (see task-22b-brief.md's trust
 * rule). Returns null if the question id does not exist.
 */
export async function recordQuiz(
  userId: string,
  questionId: string,
  selected: number,
): Promise<{ correct: boolean } | null> {
  const [q] = await db
    .select({ answer: quizQuestions.answer })
    .from(quizQuestions)
    .where(eq(quizQuestions.id, questionId))
    .limit(1);
  if (!q) return null;

  const correct = selected === q.answer;
  await db
    .insert(quizResults)
    .values({ userId, questionId, selected, correct, answeredAt: new Date() })
    .onConflictDoUpdate({
      target: [quizResults.userId, quizResults.questionId],
      set: { selected, correct, answeredAt: new Date() },
    });
  return { correct };
}

/** The `questionsByLesson` map `planMerge` needs, bounded to the given lessons. */
export async function questionIndexFor(
  lessonIds: string[],
): Promise<Record<string, { id: string; ord: number; answer: number }[]>> {
  const out: Record<string, { id: string; ord: number; answer: number }[]> = {};
  if (lessonIds.length === 0) return out;

  const rows = await db
    .select({
      id: quizQuestions.id,
      lessonId: quizQuestions.lessonId,
      ord: quizQuestions.ord,
      answer: quizQuestions.answer,
    })
    .from(quizQuestions)
    .where(inArray(quizQuestions.lessonId, lessonIds));

  for (const r of rows) {
    (out[r.lessonId] ??= []).push({ id: r.id, ord: r.ord, answer: r.answer });
  }
  return out;
}

/** The `lessonIds` set `planMerge` needs. */
export async function allLessonIds(): Promise<Record<string, true>> {
  const rows = await db.select({ id: lessons.id }).from(lessons);
  const out: Record<string, true> = {};
  for (const r of rows) out[r.id] = true;
  return out;
}

/**
 * Inserts a merge plan's rows. Both inserts are onConflictDoNothing — server
 * state already won inside planMerge (it excluded server-known keys), and
 * DoNothing makes this safe under a concurrent write race too. Returns the
 * number of rows actually merged.
 */
export async function insertMerge(userId: string, plan: MergePlan): Promise<number> {
  let merged = 0;

  if (plan.doneToInsert.length > 0) {
    const res = await db
      .insert(progress)
      .values(plan.doneToInsert.map((lessonId) => ({ userId, lessonId })))
      .onConflictDoNothing()
      .returning({ lessonId: progress.lessonId });
    merged += res.length;
  }

  if (plan.answersToInsert.length > 0) {
    const res = await db
      .insert(quizResults)
      .values(
        plan.answersToInsert.map((a) => ({
          userId,
          questionId: a.questionId,
          selected: a.selected,
          correct: a.correct,
        })),
      )
      .onConflictDoNothing()
      .returning({ questionId: quizResults.questionId });
    merged += res.length;
  }

  return merged;
}
