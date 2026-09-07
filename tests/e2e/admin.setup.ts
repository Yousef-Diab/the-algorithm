import { test as setup, expect } from "@playwright/test";

const adminAuthFile = "tests/e2e/.auth/admin.json";

/**
 * Signs in through the real /auth/sign-in UI as the dedicated ADMIN test
 * account and saves storage state for the "admin" Playwright project. This is
 * what lets draft.admin.spec.ts exercise the `!ctx.isAdmin` escape hatch in
 * app/api/quiz/[id]/route.ts and app/api/exam/[id]/route.ts — the review path
 * that lets a human see a draft lesson's quiz before it is published.
 *
 * The admin account's `user_roles` row does not need to be seeded: this is
 * its first authenticated request against a live server, and
 * lib/db/access-queries.ts accessContext() -> ensureAdminRole() inserts that
 * row automatically because the account's email is in ADMIN_EMAILS.
 *
 * E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD may not exist yet — this must fail
 * loudly, never silently skip, so a missing account is never mistaken for a
 * passing test.
 */
setup("authenticate the E2E admin test account", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must both be set in .env.local to run the admin draft-review " +
        "tests. Create a dedicated admin test account (its email must be in ADMIN_EMAILS) and set both — see .env.example.",
    );
  }

  await page.goto("/auth/sign-in");

  // Selectors verified against the REAL rendered @neondatabase/auth form, not
  // guessed: the two controls are <input name="email"> / <input name="password">
  // (labelled "Email" / "Password"), and the submit control reads "Login" — NOT
  // "Sign in" — while a second, non-submit "Sign Up" button sits next to it. So
  // name-based button matching is the fragile choice here; type="submit" inside
  // the form is the unambiguous one.
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // A successful sign-in navigates away from /auth/sign-in.
  await expect(page).not.toHaveURL(/\/auth\/sign-in/, { timeout: 30_000 });

  await page.context().storageState({ path: adminAuthFile });
});
