import { test as setup, expect } from "@playwright/test";

const authFile = "tests/e2e/.auth/user.json";

/**
 * Signs in through the real /auth/sign-in UI as a dedicated second test
 * account and saves storage state for the "authenticated" Playwright
 * project. This is what lets the signed-in half of the gating suite
 * (tests/e2e/gating.authenticated.spec.ts) exercise the entitlement path
 * rather than the admin path.
 *
 * E2E_EMAIL / E2E_PASSWORD may not exist yet — this must fail loudly, never
 * silently skip, so a missing account is never mistaken for a passing test.
 */
setup("authenticate the E2E test account", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL and E2E_PASSWORD must both be set in .env.local to run the signed-in gating test. " +
        "Create a dedicated second test account and set both — see .env.example.",
    );
  }

  await page.goto("/auth/sign-in");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /sign in/i }).first().click();

  // A successful sign-in navigates away from /auth/sign-in.
  await expect(page).not.toHaveURL(/\/auth\/sign-in/, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
