import { test, expect } from "@playwright/test";

test("an anonymous visitor is refused the exam, not the answers", async ({ request }) => {
  const res = await request.get("/api/exam/s1-exam");
  expect(res.status()).toBe(401);
  const body = await res.text();
  expect(body).not.toMatch(/"a":/);
  expect(body).not.toMatch(/"e":/);
  // No question text either — the body must be exactly the refusal shape.
  expect(body).not.toContain('"q":');
});

test("the exam route 404s an unknown lesson", async ({ request }) => {
  expect((await request.get("/api/exam/nope-99")).status()).toBe(404);
});
