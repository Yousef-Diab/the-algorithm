"use server";

import { requireUserId } from "@/lib/auth";
import { getLessonMeta, getQuiz } from "@/lib/content/queries";
import { accessContext } from "@/lib/db/access-queries";
import { canRead } from "@/lib/access";
import { getExamResult, recordExamAttempt, resetExamAttempt } from "@/lib/db/exam-queries";
import type { ExamResultDto } from "@/lib/db/exam-types";

// A "use server" module may only export async functions. Next's server-action
// export transform walks every export of this file and tries to register
// each as a server reference — including a type re-export. The type is
// erased at compile time, so the emitted chunk ends up calling
// registerServerReference() on an identifier with no runtime binding, which
// throws `ReferenceError: ExamResultDto is not defined` at SSR module
// evaluation. This compiles cleanly, typechecks cleanly, and `pnpm build`
// exits 0 — the failure is a RUNTIME throw the first time anything imports
// a real value from this file, invisible to lint/tsc/build. Consumers must
// import the type from lib/db/exam-types.ts directly (never re-export a type
// from this file, or any other "use server" file).

/**
 * Mirrors /api/exam/[id]'s gate: exams are members-only regardless of the
 * lesson's own access (asMembers), and the lesson must actually be an exam.
 * A refusal never discloses whether the lesson exists (404-equivalent: a
 * generic throw, not a distinguishable error).
 */
async function assertExamReadable(lessonId: string): Promise<void> {
  const meta = await getLessonMeta(lessonId);
  if (!meta || meta.kind !== "exam") throw new Error("not found");
  const asMembers = { sectionId: meta.sectionId, access: "members", status: meta.status };
  const ctx = await accessContext();
  if (!canRead(asMembers, ctx)) throw new Error("not found");
}

/**
 * `payloadJson` is a JSON.stringify'd string (INVARIANT 5 — React Flight
 * drops nested plain-object shapes across the client->server boundary).
 * Parsed shape: `{ picks: Record<questionId, optionText> }`.
 *
 * The plan has the client also send its own `score`; that field is dropped
 * entirely here (never read, never validated) and the score is recomputed
 * from the DB's own answer key, because trusting a client-reported score
 * would let anyone write an arbitrary result for themselves.
 */
export async function submitExam(
  lessonId: string,
  payloadJson: string,
): Promise<ExamResultDto | null> {
  const userId = await requireUserId();
  await assertExamReadable(lessonId);

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    parsed = {};
  }
  const rawPicks =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as { picks?: unknown }).picks
      : undefined;
  const candidatePicks: Record<string, unknown> =
    rawPicks && typeof rawPicks === "object" && !Array.isArray(rawPicks)
      ? (rawPicks as Record<string, unknown>)
      : {};

  const questions = await getQuiz(lessonId);
  const total = questions.length;
  if (total === 0) return getExamResult(userId, lessonId);

  // Sanitise: an entry only survives if its key is a real question id
  // belonging to THIS exam and its value is one of that question's actual
  // options. Iterating `questions` (not `candidatePicks`) makes this bound
  // by construction — a bogus question id or a bogus option string is
  // simply never looked at. A missing/invalid pick counts as wrong, not
  // skipped.
  const picks: Record<string, string> = {};
  let correctCount = 0;
  for (const q of questions) {
    const value = candidatePicks[q.id];
    const options = q.options as string[];
    if (typeof value === "string" && options.includes(value)) {
      picks[q.id] = value;
      if (value === options[q.answer]) correctCount += 1;
    }
  }

  const pct = Math.round((correctCount / total) * 100);
  return recordExamAttempt(userId, lessonId, pct, picks);
}

/**
 * Resets the graded VIEW (submitted=false, picks={}) without erasing
 * best/last/taken. Required because the plan wants graded state to survive
 * a reload but be clearable by "Retake" — a client-only reset would come
 * back graded on the next load.
 */
export async function retakeExam(lessonId: string): Promise<ExamResultDto | null> {
  const userId = await requireUserId();
  await assertExamReadable(lessonId);
  return resetExamAttempt(userId, lessonId);
}
