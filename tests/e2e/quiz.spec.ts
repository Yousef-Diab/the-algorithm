import { test, expect } from "@playwright/test";

test("an anonymous visitor gets the gate, not the answers", async ({ page, request }) => {
  // m1-01 is FREE, so its page is public — but its quiz must not be.
  const res = await request.get("/api/quiz/m1-01");
  expect(res.status()).toBe(401);
  const body = await res.text();
  expect(body).not.toMatch(/"e":/);

  await page.goto("/lesson/m1-01");
  await expect(page.getByText(/lesson check is for members/i)).toBeVisible();
  // No option buttons, and no explanation text anywhere in the DOM.
  await expect(page.locator("[data-quiz-option]")).toHaveCount(0);
});

test("the free lesson's HTML contains no quiz answers", async ({ request }) => {
  const html = await (await request.get("/lesson/m1-01")).text();
  expect(html).not.toContain('"answer"');
  expect(html).not.toContain('"explanation"');
});

test("the quiz route 404s an unknown lesson", async ({ request }) => {
  expect((await request.get("/api/quiz/nope-99")).status()).toBe(404);
});
