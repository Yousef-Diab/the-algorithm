import { test, expect } from "@playwright/test";
import { plantDraft, plantDraftLessonRow, plantDraftExamRow } from "./helpers/catalog";

// A FREE, PUBLISHED lesson on purpose: on a gated lesson this would pass for
// the wrong reason (the whole page is hidden anyway).
const FREE = "m1-01";
const MARKER = "DRAFT-MARKER-MUST-NEVER-BE-SERVED";

test("a pending draft's prose never reaches an anonymous reader of a FREE lesson", async ({ request }) => {
  const cleanup = await plantDraft(FREE, MARKER);
  try {
    const res = await request.get(`/lesson/${FREE}`);
    expect(res.status()).toBe(200); // the lesson still renders
    expect(await res.text()).not.toContain(MARKER); // invariant 6
  } finally {
    await cleanup();
  }
});

test("a draft lesson's quiz is indistinguishable from a nonexistent one", async ({ request }) => {
  const res = await request.get("/api/quiz/definitely-not-a-lesson");
  expect(res.status()).toBe(404);
});

/**
 * Task 15 added `if (meta.status !== "published" && !ctx.isAdmin) → 404` to
 * app/api/quiz/[id]/route.ts and app/api/exam/[id]/route.ts. Before that
 * guard, a DRAFT lesson answered 401 "members only" to an anonymous request
 * while an UNKNOWN id answered 404 — and that difference alone confirmed the
 * draft existed. The test above only probes an unknown id (which was already
 * 404 before Task 15), so it does not exercise the new guard at all. This one
 * does: a dedicated status='draft' row, not merely a row carrying a draft
 * body (plantDraft leaves `status` untouched, so it would not trip the guard).
 */
test("a status='draft' lesson's quiz answers 404, not 401, to an anonymous request", async ({ request }) => {
  const { id, cleanup } = await plantDraftLessonRow();
  try {
    const res = await request.get(`/api/quiz/${id}`);
    expect(res.status(), `expected 404 (indistinguishable from unknown) but got ${res.status()} — a 401 here means the draft's existence just leaked`).toBe(404);
    expect(res.status()).not.toBe(401);
  } finally {
    await cleanup();
  }
});

/**
 * Task 15 put the IDENTICAL draft guard in app/api/exam/[id]/route.ts, which
 * matters at least as much: it also serves a signed-in reader's saved exam
 * result. A mutant that deleted the guard from the exam route alone would
 * have passed every other test in this file, since none of them touch
 * /api/exam/.
 *
 * The trap: app/api/exam/[id]/route.ts:12 returns 404 for
 * `!meta || meta.kind !== "exam"` BEFORE it ever reaches the draft guard at
 * line 21. A probe row with kind='lesson' (like DRAFT_PROBE_ID above) would
 * 404 there for the WRONG reason — the kind guard, not the status guard —
 * even if the status guard were deleted entirely. So this probe is created
 * with kind='exam', which makes the kind guard evaluate false and fall
 * through, leaving the status guard as the only thing that can explain a 404.
 *
 * To prove the two 404s (kind-mismatch vs draft-status) have different
 * causes without creating an unsafe status='published' probe row (which
 * would be visible to catalogRows()'s hard-coded EXPECTED_ROW_COUNT under
 * fullyParallel), this test also probes a real, PUBLISHED, non-exam lesson
 * id at the same route: it 404s too, but for the kind-mismatch reason, not
 * a draft one. Same status code, different cause — the exam-kind probe's
 * 404 cannot be that one, because its kind guard passes.
 */
test("a status='draft' EXAM row answers 404, not 401, to an anonymous request — and the 404 is the STATUS guard's, not the KIND guard's", async ({
  request,
}) => {
  const { id, cleanup } = await plantDraftExamRow();
  try {
    const res = await request.get(`/api/exam/${id}`);
    expect(
      res.status(),
      `expected 404 (indistinguishable from unknown) but got ${res.status()} — a 401 here means the draft exam's existence just leaked`,
    ).toBe(404);
    expect(res.status()).not.toBe(401);

    // A genuine non-exam, PUBLISHED lesson id also 404s here — but only
    // because meta.kind !== "exam", never reaching the status guard at all.
    // This is the other cause behind the same status code.
    const nonExam = await request.get(`/api/exam/${FREE}`);
    expect(nonExam.status()).toBe(404);
  } finally {
    await cleanup();
  }
});
