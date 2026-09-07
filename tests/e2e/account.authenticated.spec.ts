import { test, expect } from "@playwright/test";

/**
 * The account surface the auth UI's avatar menu links to. Guards three
 * regressions at once: the pages existing at all (/account/settings was a 404
 * until the routes were added), the tabs not raising an error toast as the user
 * moves between them, and the change-email card staying hidden — this Neon Auth
 * project answers "Change email is disabled", so offering the control is a trap.
 */
test("the account tabs render and switch without an error", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/api/auth/") && r.status() >= 400) {
      failed.push(`${r.status()} ${new URL(r.url()).pathname}`);
    }
  });
  // The sidebar has its own "Account…" lesson links, so the tabs must be
  // addressed through their own nav rather than by accessible name alone.
  const nav = page.locator('nav[aria-label="Account settings"]');

  await page.goto("/account/settings");
  await expect(page.getByText("Please enter your full name", { exact: false })).toBeVisible();
  await expect(page.getByText(/change email/i)).toHaveCount(0);

  // Twice: the second pass re-mounts each tab from the client-side cache,
  // which is the path the stale-read toast appeared on.
  for (let pass = 0; pass < 2; pass++) {
    await nav.getByRole("link", { name: "Security" }).click();
    await expect(page).toHaveURL(/\/account\/security$/);
    await expect(page.getByText(/change password/i).first()).toBeVisible();

    await nav.getByRole("link", { name: "Account" }).click();
    await expect(page).toHaveURL(/\/account\/settings$/);
  }

  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  expect(failed).toEqual([]);
});
