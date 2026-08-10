import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

/**
 * The signed-in half of the gating suite — the anonymous half is
 * tests/e2e/gating.spec.ts. A gating test that only proves the anonymous
 * path is half a test: this proves a members lesson IS reachable once the
 * signed-in account holds a real entitlement (source='admin_grant',
 * scope='all'), exercising the entitlement path rather than the admin path.
 *
 * Runs only in the "authenticated" Playwright project, which depends on
 * auth.setup.ts and therefore only runs when E2E_EMAIL / E2E_PASSWORD are set.
 */
test.beforeAll(() => {
  const email = process.env.E2E_EMAIL;
  if (!email) throw new Error("E2E_EMAIL is not set — see auth.setup.ts");
  execFileSync(
    "node",
    ["--env-file=.env.local", "--experimental-strip-types", "scripts/grant-entitlement.mjs", email],
    { stdio: "inherit" },
  );
});

/** The same members lesson the anonymous half (gating.spec.ts) proves is locked. */
const MEMBERS = "p1-02";

test("a members lesson is reachable to a signed-in account with an entitlement", async ({ page }) => {
  const res = await page.goto(`/lesson/${MEMBERS}`);
  expect(res?.status()).toBe(200);

  const body = await page.textContent("body");
  expect(body).not.toMatch(/is for members/i);
  // The hero, which is public either way.
  expect(body).toContain("The Judas Swing");
  // The gated prose — the exact strings gating.spec.ts proves are absent
  // anonymously. This is the other half of the claim.
  expect(body).toContain("which one of these would you actually want to learn how to find?");
  expect(body).toContain("hunt three to five handles");
});
