import { test, expect } from "@playwright/test";
import { collectErrors } from "./helpers/expect-no-errors";

/**
 * Pins the quiz reset control Task 24a restored (verify.py's "every quiz
 * exposes a reset control that actually clears the graded state"). Signed in
 * because the quiz is members-only regardless of the lesson's own access
 * (see tests/e2e/gating.authenticated.spec.ts's reasoning for the same
 * pattern on exams).
 *
 * m1-01 is the same free-lesson-with-a-gated-quiz fixture
 * tests/e2e/quiz.spec.ts already uses for the anonymous half.
 *
 * Reset is proven with a RELOAD, not just a UI check: Quiz.tsx's
 * handleReset() awaits resetLessonQuiz() (the server action) and only
 * clears local state on success, so a reload that still shows an ungraded
 * quiz proves the DB row was actually deleted — not a cosmetic client-side
 * clear, which is exactly what verify.py's "actually clears" wording guards
 * against.
 *
 * Stateful and must be re-runnable: it resets FIRST (rather than relying on
 * end-of-test cleanup) so a prior run left in a graded or ungraded state
 * both converge to the same starting point. Verified by running this file
 * twice in a row.
 */
test("answering a quiz question grades it, reset clears it, and the clear survives a reload", async ({
  page,
}) => {
  const errors = collectErrors(page);

  await page.goto("/lesson/m1-01");
  const options = page.locator("[data-quiz-option]");
  await expect(options.first()).toBeVisible();

  // Converge to a clean (ungraded) starting state regardless of what a prior
  // run left behind.
  const resetButton = page.locator("[data-quiz-reset]");
  if (await resetButton.count()) {
    await resetButton.click();
    await expect(resetButton).toHaveCount(0);
  }
  await expect(options.first()).toBeEnabled();

  // Answer the first question.
  await options.first().click();
  await expect(options.first()).toBeDisabled();
  await expect(resetButton).toBeVisible();

  // Reset clears the graded state in the UI...
  await resetButton.click();
  await expect(resetButton).toHaveCount(0);
  await expect(options.first()).toBeEnabled();

  // ...and the clear actually persisted server-side: a reload must not
  // restore the graded state (loadMyQuiz() re-hydrates `answered` from the
  // DB on mount, so a surviving row would re-grade the quiz here).
  await page.reload();
  await expect(options.first()).toBeVisible();
  await expect(options.first()).toBeEnabled();
  await expect(page.locator("[data-quiz-reset]")).toHaveCount(0);

  expect(errors).toEqual([]);
});
