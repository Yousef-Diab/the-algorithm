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
 * once. This reads/writes only the calling user's OWN previously-local data
 * (never another user's, never a lesson body) so it is deliberately NOT
 * gated per-lesson — do not "fix" that by adding a canRead check here.
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
  const lessonIdsInPayload = Array.from(
    new Set(
      local.done.concat(
        Object.keys(local.quiz)
          .map((k) => /^(.*)-(\d+)$/.exec(k)?.[1])
          .filter((x): x is string => Boolean(x)),
      ),
    ),
  );
  const questionsByLesson = await questionIndexFor(lessonIdsInPayload);

  const plan = planMerge(local, server, lessonIds, questionsByLesson);
  const merged = await insertMerge(user.id, plan);
  return { merged, dropped: plan.dropped };
}
