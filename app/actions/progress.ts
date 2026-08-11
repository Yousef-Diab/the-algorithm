"use server";

import { getCurrentUser, requireUserId } from "@/lib/auth";
import { getLessonMeta } from "@/lib/content/queries";
import { accessContext } from "@/lib/db/access-queries";
import { canRead } from "@/lib/access";
import {
  getUserProgress,
  setProgress,
  getQuizAnswers,
  recordQuiz,
  questionIndexFor,
  allLessonIds,
  insertMerge,
  planMerge,
  type LocalState,
  type ServerState,
} from "@/lib/db/progress-queries";
import { db } from "@/lib/db";
import { quizResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Signed-out returns null so the client falls back to localStorage. */
export async function loadMyProgress(): Promise<string[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getUserProgress(user.id);
}

export async function toggleDone(lessonId: string, done: boolean): Promise<void> {
  const userId = await requireUserId();
  await setProgress(userId, lessonId, done);
}

/**
 * Mirrors the /api/quiz/[id] gate: quizzes are members-only regardless of the
 * lesson's own access, and a refusal never discloses whether the lesson
 * exists (404-equivalent: null / generic throw, not a distinguishable error).
 */
async function assertQuizReadable(lessonId: string): Promise<void> {
  const meta = await getLessonMeta(lessonId);
  if (!meta) throw new Error("not found");
  const asMembers = { sectionId: meta.sectionId, access: "members", status: meta.status };
  const ctx = await accessContext();
  if (!canRead(asMembers, ctx)) throw new Error("not found");
}

export async function loadMyQuiz(
  lessonId: string,
): Promise<Record<string, { selected: number; correct: boolean }> | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    await assertQuizReadable(lessonId);
  } catch {
    return null;
  }
  return getQuizAnswers(user.id, lessonId);
}

export async function recordQuizAction(
  lessonId: string,
  questionId: string,
  selected: number,
): Promise<void> {
  const userId = await requireUserId();
  await assertQuizReadable(lessonId);

  // The lesson-level gate above is not enough on its own: a caller could pass
  // a free lesson's id alongside a gated lesson's question id and bypass it.
  // Verify the question actually belongs to this lesson before recording.
  const index = await questionIndexFor([lessonId]);
  const belongs = (index[lessonId] ?? []).some((q) => q.id === questionId);
  if (!belongs) throw new Error("not found");

  await recordQuiz(userId, questionId, selected);
}

/**
 * Migrates a signed-in user's prior localStorage state into the database,
 * once. `done` (lesson completion) is the user's own reading history and
 * carries no gated content, so it merges ungated. Quiz answers are graded
 * against the real answer key and become a permanent per-user record, so
 * they ARE gated through canRead — the SAME choke point as everything else,
 * not a second rule — per distinct lesson id referenced in the local `quiz`
 * payload. A lesson that fails canRead, or no longer exists, is simply left
 * out of `questionsByLesson`, so planMerge naturally reports its keys via
 * `dropped` instead of silently discarding them; this does not throw, so a
 * partial merge still succeeds for whatever the user IS entitled to.
 *
 * Legitimate case this affects: on the old static site every quiz was free,
 * so a non-member can genuinely hold legacy `ict-quiz` answers for a lesson
 * that is now members-only. Dropping those is the correct trade — we will
 * not store graded results for content the user cannot access; they can
 * retake the quiz once entitled.
 */
export async function mergeLocalState(
  payloadJson: string,
): Promise<{ merged: number; dropped: string[] } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    return { merged: 0, dropped: [] };
  }
  if (typeof parsed !== "object" || parsed === null) {
    return { merged: 0, dropped: [] };
  }

  const raw = parsed as { done?: unknown; quiz?: unknown };
  const local: LocalState = {
    done: Array.isArray(raw.done) ? raw.done.map(String) : [],
    quiz:
      raw.quiz && typeof raw.quiz === "object" && !Array.isArray(raw.quiz)
        ? (raw.quiz as Record<string, number>)
        : {},
  };

  const serverDone = await getUserProgress(user.id);
  const answeredRows = await db
    .select({ questionId: quizResults.questionId, selected: quizResults.selected })
    .from(quizResults)
    .where(eq(quizResults.userId, user.id));
  const answered: Record<string, number> = {};
  for (const r of answeredRows) answered[r.questionId] = r.selected;
  const server: ServerState = { done: serverDone, answered };

  const lessonIds = await allLessonIds();

  const quizLessonIds = Array.from(
    new Set(
      Object.keys(local.quiz)
        .map((k) => /^(.*)-(\d+)$/.exec(k)?.[1])
        .filter((x): x is string => Boolean(x)),
    ),
  );

  // One accessContext() call, reused for every lesson below — not N round
  // trips. Lessons that fail canRead (or don't exist) are excluded from
  // questionsByLesson; planMerge then can't resolve their quiz keys and
  // reports them in `dropped`.
  const ctx = await accessContext();
  const readableQuizLessonIds: string[] = [];
  for (const lessonId of quizLessonIds) {
    const meta = await getLessonMeta(lessonId);
    if (!meta) continue;
    const asMembers = { sectionId: meta.sectionId, access: "members", status: meta.status };
    if (canRead(asMembers, ctx)) readableQuizLessonIds.push(lessonId);
  }

  const questionsByLesson = await questionIndexFor(readableQuizLessonIds);

  const plan = planMerge(local, server, lessonIds, questionsByLesson);
  const merged = await insertMerge(user.id, plan);
  return { merged, dropped: plan.dropped };
}
