import { test, expect } from "@playwright/test";

test("the auth handler answers and the sign-in view renders", async ({ page, request }) => {
  const res = await request.get("/api/auth/get-session");
  expect(res.status()).toBe(200);

  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/auth/sign-in");
  await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
