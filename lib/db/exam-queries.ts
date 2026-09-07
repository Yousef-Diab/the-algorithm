import "server-only";
import { eq, and, sql } from "drizzle-orm";
import { db } from "./index";
import { examResults } from "./schema";
import type { ExamResultDto } from "./exam-types";

export type { ExamResultDto };

function toDto(row: {
  best: number;
  last: number;
  taken: number;
  submitted: boolean;
  picks: unknown;
}): ExamResultDto {
  return {
    best: row.best,
    last: row.last,
    taken: row.taken,
    submitted: row.submitted,
    picks: (row.picks ?? {}) as Record<string, string>,
  };
}

/** The user's saved exam result, or null when there is none. */
export async function getExamResult(userId: string, lessonId: string): Promise<ExamResultDto | null> {
  const [row] = await db
    .select()
    .from(examResults)
    .where(and(eq(examResults.userId, userId), eq(examResults.lessonId, lessonId)))
    .limit(1);
  return row ? toDto(row) : null;
}

/**
 * Records one submitted attempt. `pct` is an integer 0-100 (the caller has
 * already computed it server-side — this function trusts its caller, not the
 * client). `best` is computed in SQL via GREATEST so a concurrent write can't
 * race a read-then-write; `taken` increments in SQL for the same reason.
 */
export async function recordExamAttempt(
  userId: string,
  lessonId: string,
  pct: number,
  picks: Record<string, string>,
): Promise<ExamResultDto> {
  const [row] = await db
    .insert(examResults)
    .values({
      userId,
      lessonId,
      best: pct,
      last: pct,
      taken: 1,
      submitted: true,
      picks,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [examResults.userId, examResults.lessonId],
      set: {
        last: pct,
        best: sql`greatest(${examResults.best}, ${pct})`,
        taken: sql`${examResults.taken} + 1`,
        submitted: true,
        picks,
        updatedAt: new Date(),
      },
    })
    .returning();
  return toDto(row);
}

/**
 * Resets the *view* of a prior attempt without erasing the record: clears
 * `submitted` and `picks`, leaves `best`/`last`/`taken` untouched. `taken`
 * only increments on the next submit. Returns null if there is no row yet.
 */
export async function resetExamAttempt(userId: string, lessonId: string): Promise<ExamResultDto | null> {
  const [row] = await db
    .update(examResults)
    .set({ submitted: false, picks: {}, updatedAt: new Date() })
    .where(and(eq(examResults.userId, userId), eq(examResults.lessonId, lessonId)))
    .returning();
  return row ? toDto(row) : null;
}
