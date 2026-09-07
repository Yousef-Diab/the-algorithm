import { test, expect } from "@playwright/test";

/**
 * The signed-in half of the exam suite — the anonymous half (401, no
 * question text leaked) is tests/e2e/exam.spec.ts. Runs only in the
 * "authenticated" Playwright project (see playwright.config.ts), which
 * supplies the signed-in storage state via auth.setup.ts.
 *
 * s1-exam is a real exam lesson with 45 questions.
 *
 * This test is stateful: it writes an exam_results row for the E2E account,
 * and the reload assertion depends on that row persisting. It ends with a
 * retake, which resets `submitted` to false server-side (best/last/taken are
 * left intact), so a second run starts from the same "ungraded" shape the
 * first run did — verified by running this spec twice in a row.
 */
test("the exam grades nothing until submit, then scores against 80%", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    // Same designed 401 noise as quiz.spec.ts / lightbox.spec.ts, just for
    // the exam route instead of the quiz route.
    if (/\/api\/exam\//.test(m.location().url)) return;
    errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/lesson/s1-exam");
  const opts = page.locator("[data-exam-option]");
  await expect(opts.first()).toBeVisible();

  await opts.first().click();
  // Still ungraded: no correct/wrong styling, no explanation revealed.
  await expect(page.locator("[data-exam-correct]")).toHaveCount(0);
  await expect(page.locator("[data-exam-explanation][data-shown='true']")).toHaveCount(0);

  await page.getByRole("button", { name: /submit/i }).click();
  // Scoped to the result line, not the whole page: several option labels
  // themselves contain a literal "%" (e.g. "62% premium level"), so an
  // unscoped getByText(/%/) is a strict-mode violation once every option is
  // rendered.
  const result = page.locator("[data-exam-result]");
  await expect(result).toContainText("%");
  await expect(result).toContainText("80%");
  await expect(page.locator("[data-exam-explanation][data-shown='true']").first()).toBeVisible();

  // Retakeable, and the graded state survives a reload before the retake.
  await page.reload();
  await expect(page.locator("[data-exam-explanation][data-shown='true']").first()).toBeVisible();
  await page.getByRole("button", { name: /retake/i }).click();
  await expect(page.locator("[data-exam-explanation][data-shown='true']")).toHaveCount(0);

  expect(errors).toEqual([]);
});
