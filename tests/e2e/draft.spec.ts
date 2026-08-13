import { test, expect } from "@playwright/test";
import { plantDraft, plantDraftLessonRow } from "./helpers/catalog";

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
