import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { lessons, months, quizQuestions, quizResults } from "../db/schema";
import { assertBlocks } from "./blocks";
import { assertMeta, assertQuiz, assertSourceRef } from "./write-validate";

/**
 * THE db HANDLE IS INJECTED, and this module imports NEITHER `@/lib/db` NOR
 * any `next/*`. `lib/db/index.ts:1` is `import "server-only"` — a package that
 * is NOT installed; Next aliases it at build time and vitest.config.ts:21
 * aliases it to a stub. A plain Node process (mcp/server.ts, scripts/*.mjs)
 * that reaches lib/db dies with ERR_MODULE_NOT_FOUND, and nothing in lint,
 * tsc, pnpm build or the unit suite would tell you. Same invisible-failure
 * class as the "use server" type-export trap. Do not "simplify" this away.
 *
 * Imports in this file are RELATIVE, not `@/`, for the same reason: this
 * module is loaded by a plain Node process (the MCP server, the CLIs) in
 * addition to Next and Vitest, and only Next/Vitest resolve the `@/` alias.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDb = any;

export interface WriterDeps {
  db: AnyDb;
  revalidate: (tags: string[]) => Promise<void> | void;
  repoRoot?: string;
}

/** Invariant 2′: EVERY write purges all three, uniformly. */
export function tagsFor(id: string): string[] {
  return [`lesson:${id}`, `lesson-meta:${id}`, "catalog"];
}

export function createWriter({ db, revalidate, repoRoot = process.cwd() }: WriterDeps) {
  async function writeLessonBody(id: string, blocks: unknown, sourceRef: string): Promise<void> {
    const ref = assertSourceRef(sourceRef, repoRoot);
    const body = assertBlocks(blocks);
    await db
      .update(lessons)
      .set({ bodyDraft: body, sourceRefDraft: ref, writeOrigin: "cms", updatedAt: new Date() })
      .where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  async function writeLessonMeta(id: string, patch: unknown): Promise<void> {
    const meta = assertMeta(patch);
    if (Object.keys(meta).length === 0) return;
    await db.update(lessons).set({ ...meta, updatedAt: new Date() }).where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  /**
   * ONE statement, so it is atomic without a transaction (neon-http has no
   * interactive ones). `WHERE body_draft IS NOT NULL` + RETURNING is what makes
   * "there was no draft" reportable instead of a silent no-op success.
   * The cache purge is still a separate round trip — see the spec §4.4.
   */
  async function promoteDraft(id: string): Promise<boolean> {
    const rows = await db
      .update(lessons)
      .set({
        body: sql`${lessons.bodyDraft}`,
        sourceRef: sql`${lessons.sourceRefDraft}`,
        bodyDraft: null,
        sourceRefDraft: null,
        writeOrigin: "cms",
        updatedAt: new Date(),
      })
      .where(and(eq(lessons.id, id), isNotNull(lessons.bodyDraft)))
      .returning({ id: lessons.id });
    if (rows.length === 0) return false;
    await revalidate(tagsFor(id));
    return true;
  }

  async function discardDraft(id: string): Promise<boolean> {
    const rows = await db
      .update(lessons)
      .set({ bodyDraft: null, sourceRefDraft: null, updatedAt: new Date() })
      .where(and(eq(lessons.id, id), isNotNull(lessons.bodyDraft)))
      .returning({ id: lessons.id });
    if (rows.length === 0) return false;
    await revalidate(tagsFor(id));
    return true;
  }

  /**
   * RETURNING is here so a typo'd id cannot report success at the publish
   * gate: this script IS the deliberate human review step the whole project
   * is built around, so a silent no-op on an unknown id is the wrong failure
   * mode. Mirrors promoteDraft/discardDraft above — same shape, same
   * no-purge-on-miss behaviour.
   */
  async function setStatus(id: string, status: "draft" | "published"): Promise<boolean> {
    const rows = await db
      .update(lessons)
      .set({ status, publishedAt: status === "published" ? new Date() : null, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning({ id: lessons.id });
    if (rows.length === 0) return false;
    await revalidate(tagsFor(id));
    return true;
  }

  async function setAccess(id: string, access: "free" | "members" | "admin"): Promise<void> {
    await db.update(lessons).set({ access, updatedAt: new Date() }).where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  /**
   * Id-preserving, atomic upsert. Three constraints in tension, resolved as
   * follows:
   *
   *  1. `quiz_results` keys on `question_id` with no lesson column
   *     (invariant 4) — a question carrying an `id` must UPDATE that row,
   *     never delete-and-reinsert with a fresh uuid, or every user's answer
   *     history for it is destroyed.
   *  2. `quiz_questions_lesson_ord_uq` is unique on (lesson_id, ord) — a
   *     reorder that assigns final ords directly can transiently collide
   *     mid-sequence (e.g. swapping questions 2 and 3).
   *  3. This is neon-http: there is no interactive transaction. Two separate
   *     calls meant to bracket a transaction are two separate sessions, and
   *     a "rollback" after a failed second call is a no-op — the first call
   *     already committed. `db.batch([...])` is the one primitive that IS
   *     atomic here (it routes through Neon's transactional multi-statement
   *     endpoint), so the whole settle — park, upsert, delete/re-settle —
   *     is built as one batch and sent together.
   *
   * The settle: park every existing row at `ord = -ord - 1` (negative space
   * is disjoint from every final ord, 0..n-1, so no collision is possible),
   * then upsert each incoming question at its final ord. Orphans (existing
   * rows absent from the incoming list) are either deleted (deleteMissing)
   * or re-settled at the tail (qs.length + n) so they never end the batch
   * sitting at a negative ord.
   */
  async function upsertQuiz(
    id: string,
    questions: unknown,
    deleteMissing = false,
  ): Promise<{ inserted: number; updated: number; deleted: number; cascadeAnswers: number }> {
    const qs = assertQuiz(questions);

    // §4.4: a live quiz must not reference prose that exists only in an
    // unpromoted draft. Refuse rather than create that mismatch.
    const [row] = await db
      .select({ bodyDraft: lessons.bodyDraft })
      .from(lessons)
      .where(eq(lessons.id, id))
      .limit(1);
    if (!row) throw new Error(`no such lesson: ${id}`);
    if (row.bodyDraft !== null && row.bodyDraft !== undefined)
      throw new Error(`${id} has a pending draft body — promote or discard the pending draft first`);

    const existing: { id: string }[] = await db
      .select({ id: quizQuestions.id })
      .from(quizQuestions)
      .where(eq(quizQuestions.lessonId, id))
      .orderBy(quizQuestions.ord);
    const keep = new Set(qs.filter((q) => q.id).map((q) => q.id as string));
    const orphans = existing.filter((e) => !keep.has(e.id)).map((e) => e.id);

    // A supplied id must belong to THIS lesson's existing questions. Without
    // this, onConflictDoUpdate's target is bare quizQuestions.id, so an id
    // copied/stale from another lesson would silently rewrite that other
    // lesson's row in place — moving a question out from under it. Mirrors
    // project #1's recordQuizAction, which verifies questionId belongs to
    // lessonId for the same reason (a mismatched id walks past the
    // lesson-level access gate). Reject the whole call rather than dropping
    // or converting the bad question — either would hide a caller bug.
    const existingIds = new Set(existing.map((e) => e.id));
    for (const q of qs) {
      if (q.id && !existingIds.has(q.id))
        throw new Error(`upsertQuiz: question id "${q.id}" does not belong to lesson "${id}"`);
    }

    // Report before deleting — a destructive call is never silent.
    let cascadeAnswers = 0;
    if (orphans.length) {
      const [c] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(quizResults)
        .where(inArray(quizResults.questionId, orphans));
      cascadeAnswers = c?.n ?? 0;
    }

    // ATOMIC ord settle. Step 1 parks every existing row at a negative ord,
    // which is disjoint from every final ord, so no unique-index collision
    // is possible in step 2. db.batch is a real transaction on neon-http.
    const stmts: unknown[] = [
      db
        .update(quizQuestions)
        .set({ ord: sql`-${quizQuestions.ord} - 1` })
        .where(eq(quizQuestions.lessonId, id)),
    ];
    qs.forEach((q, i) => {
      const values = { lessonId: id, ord: i, q: q.q, options: q.options, answer: q.answer, explanation: q.explanation };
      stmts.push(
        q.id
          ? db
              .insert(quizQuestions)
              .values({ id: q.id, ...values })
              .onConflictDoUpdate({ target: quizQuestions.id, set: values })
          : db.insert(quizQuestions).values(values),
      );
    });
    if (deleteMissing) {
      if (orphans.length) stmts.push(db.delete(quizQuestions).where(inArray(quizQuestions.id, orphans)));
    } else {
      // Orphans are kept but must not be left parked at a negative ord —
      // re-settle them at the tail, in their original relative order.
      orphans.forEach((orphanId, n) => {
        stmts.push(db.update(quizQuestions).set({ ord: qs.length + n }).where(eq(quizQuestions.id, orphanId)));
      });
    }
    await db.batch(stmts);

    await revalidate(tagsFor(id));
    return {
      inserted: qs.filter((q) => !q.id).length,
      updated: qs.filter((q) => q.id).length,
      deleted: deleteMissing ? orphans.length : 0,
      cascadeAnswers,
    };
  }

  function kebab(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /**
   * A lesson is born draft, fail-closed on access, with a slug the caller
   * cannot set (invariant: slug is DERIVED — it is the chart filename stem
   * and carries lessons_slug_uq). (month_id, section_id) is a composite FK
   * (schema.ts:96-100), so a month/section mismatch is prechecked here and
   * reported by name rather than surfacing as a raw constraint violation.
   */
  async function createLesson(input: unknown): Promise<string> {
    if (typeof input !== "object" || input === null) throw new Error("createLesson: expected an object");
    const i = input as Record<string, unknown>;
    for (const k of ["id", "sectionId", "ord", "title", "heading", "crumb", "kind"]) {
      if (i[k] === undefined) throw new Error(`createLesson: ${k} is required`);
    }
    const access = i.access ?? "members"; // invariant 3: absent means closed
    if (!["free", "members", "admin"].includes(access as string))
      throw new Error(`createLesson: access must be free, members or admin (got "${String(i.access)}")`);
    if (!["lesson", "review", "exam"].includes(i.kind as string))
      throw new Error(`createLesson: kind must be lesson, review or exam`);

    // (month_id, section_id) is a COMPOSITE FK (schema.ts:96-100). Precheck so
    // a mismatch reports itself instead of surfacing a raw constraint violation.
    if (i.monthId) {
      const [m] = await db
        .select({ id: months.id })
        .from(months)
        .where(and(eq(months.id, i.monthId as string), eq(months.sectionId, i.sectionId as string)))
        .limit(1);
      if (!m) throw new Error(`createLesson: month "${String(i.monthId)}" does not belong to section "${String(i.sectionId)}"`);
    }

    const slug = `${String(i.id)}-${kebab(String(i.title))}`;
    const [clash] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.slug, slug)).limit(1);
    if (clash) throw new Error(`createLesson: slug "${slug}" is already used by lesson "${clash.id}"`);

    await db.insert(lessons).values({
      id: i.id as string,
      sectionId: i.sectionId as string,
      monthId: (i.monthId as string) ?? null,
      slug,
      title: i.title as string,
      heading: i.heading as string,
      crumb: i.crumb as string,
      desc: i.desc ? assertMeta({ desc: i.desc }).desc : [],
      ord: i.ord as number,
      kind: i.kind as string,
      access: access as string,
      status: "draft", // never born visible
      body: [],
      writeOrigin: "cms",
    });
    await revalidate(tagsFor(i.id as string));
    return i.id as string;
  }

  return {
    writeLessonBody,
    writeLessonMeta,
    promoteDraft,
    discardDraft,
    setStatus,
    setAccess,
    upsertQuiz,
    createLesson,
  };
}
