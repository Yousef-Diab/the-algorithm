import { test, expect } from "@playwright/test";

/**
 * Reproduces verify.py's check that the question count a summary/review page
 * states in prose matches the exam that actually renders. Ground truth:
 * s1-review's prose says "45 questions" and s1-exam has 45 questions;
 * s2-review says "43 questions" and s2-exam has 43.
 *
 * Named .authenticated.spec.ts (a deliberate deviation from the plan's
 * literal summary-count.spec.ts, per the brief's "choose deliberately and
 * say why"): /api/exam/{id} is members-only for BOTH s1-exam and s2-exam
 * even though s1-review itself is a free page, so reading either exam's
 * real question count needs a signed-in request regardless of which review
 * page states the count. Kept as one spec (not split) since both halves
 * share the same "stated count must match rendered count, and at least one
 * side must have stated a count" assertion shape.
 *
 * A summary MAY state no count (then that section is skipped); it must NOT
 * state a wrong one. To keep the whole check from passing vacuously if the
 * regex simply finds nothing on both pages, this test explicitly asserts at
 * least one section DID state a count.
 */
const SECTIONS = [
  { review: "s1-review", exam: "s1-exam" },
  { review: "s2-review", exam: "s2-exam" },
];

test("each review page's stated exam question count matches the exam that actually renders", async ({
  request,
}) => {
  let anySectionStatedACount = false;

  for (const { review, exam } of SECTIONS) {
    const reviewRes = await request.get(`/lesson/${review}`);
    expect(reviewRes.status(), review).toBe(200);
    const reviewHtml = await reviewRes.text();

    const match = /(\d+)\s+questions\b/i.exec(reviewHtml);
    if (!match) continue; // no stated count on this page — that's allowed, just skip it

    anySectionStatedACount = true;
    const statedCount = Number(match[1]);

    const examRes = await request.get(`/api/exam/${exam}`);
    expect(examRes.status(), exam).toBe(200);
    const body = (await examRes.json()) as { questions: unknown[] };

    expect(statedCount, `${review} states ${statedCount} but ${exam} renders ${body.questions.length}`).toBe(
      body.questions.length,
    );
  }

  expect(
    anySectionStatedACount,
    "neither review page's prose stated a question count — this check would otherwise pass vacuously",
  ).toBe(true);
});
