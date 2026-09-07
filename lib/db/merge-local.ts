export interface LocalState {
  done: string[];
  /** "{lessonId}-{qIndex}" → picked option index (the pre-migration shape). */
  quiz: Record<string, number>;
}

export interface ServerState {
  done: string[];
  /** questionId → picked option index. */
  answered: Record<string, number>;
}

export interface MergePlan {
  doneToInsert: string[];
  answersToInsert: { questionId: string; selected: number; correct: boolean }[];
  /** Local keys discarded because they no longer resolve — reported, not silent. */
  dropped: string[];
}

/**
 * Pure: the caller supplies the lesson id set and each lesson's questions, so
 * this is testable with no database. Server state always wins; local state only
 * fills gaps.
 */
export function planMerge(
  local: LocalState,
  server: ServerState,
  lessonIds: Record<string, true>,
  questionsByLesson: Record<string, { id: string; ord: number; answer: number }[]>,
): MergePlan {
  const plan: MergePlan = { doneToInsert: [], answersToInsert: [], dropped: [] };
  const serverDone = new Set(server.done);

  for (const id of Array.isArray(local.done) ? local.done : []) {
    if (!lessonIds[id]) plan.dropped.push(id);
    else if (!serverDone.has(id)) plan.doneToInsert.push(id);
  }

  const quiz = local.quiz && typeof local.quiz === "object" ? local.quiz : {};
  for (const [key, selected] of Object.entries(quiz)) {
    if (typeof selected !== "number") { plan.dropped.push(key); continue; }
    const m = /^(.*)-(\d+)$/.exec(key);
    const lessonId = m?.[1];
    const ord = m ? Number(m[2]) : NaN;
    const q = lessonId ? questionsByLesson[lessonId]?.find((x) => x.ord === ord) : undefined;
    if (!q) { plan.dropped.push(key); continue; }
    if (q.id in server.answered) continue; // server wins
    plan.answersToInsert.push({ questionId: q.id, selected, correct: selected === q.answer });
  }
  return plan;
}
