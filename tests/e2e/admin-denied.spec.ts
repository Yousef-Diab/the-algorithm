import { test, expect } from "@playwright/test";

/**
 * 404, never 403 or a redirect. A redirect to sign-in would confirm /admin
 * exists to anyone who probes it; a 403 confirms it to any signed-in member.
 */
const ROUTES = ["/admin", "/admin/lesson/m1-01", "/admin/lesson/does-not-exist"];

for (const route of ROUTES) {
  test(`anonymous GET ${route} is 404`, async ({ request }) => {
    const res = await request.get(route);
    expect(res.status(), `${route} must 404 for an anonymous visitor — got ${res.status()}`).toBe(404);
  });
}

test("an anonymous visitor is not redirected to sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/auth\/sign-in/);
});
