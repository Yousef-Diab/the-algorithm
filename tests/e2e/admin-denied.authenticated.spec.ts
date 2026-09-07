import { test, expect } from "@playwright/test";

/**
 * Runs in the "authenticated" project — the MEMBER account, which holds an
 * entitlement but is NOT in ADMIN_EMAILS. This is the permissive direction: a
 * guard that only refuses anonymous visitors would pass the spec above and
 * still be broken.
 */
const ROUTES = ["/admin", "/admin/lesson/m1-01"];

for (const route of ROUTES) {
  test(`a signed-in non-admin member GET ${route} is 404`, async ({ request }) => {
    const res = await request.get(route);
    expect(res.status(), `${route} must 404 for a signed-in non-admin — got ${res.status()}`).toBe(404);
  });
}

test("the member session really is signed in (so the 404s above are not vacuous)", async ({ page }) => {
  // WITHOUT THIS the file is worthless: if the storage state were empty, both
  // assertions above would pass for the wrong reason — they would merely be
  // re-testing the anonymous case that admin-denied.spec.ts already covers.
  // Asserting on the cookie jar directly rather than on rendered text, which
  // would couple this to the auth UI's wording.
  await page.goto("/");
  const state = await page.context().storageState();
  expect(state.cookies.length, "the authenticated project must carry a real session").toBeGreaterThan(0);
});
