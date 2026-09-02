import { test, expect, type Page } from "@playwright/test";

/**
 * Neon Auth emails a 6-digit code on sign-up, not a link (verification links
 * need a custom email provider; this project uses Neon's shared sender). The
 * auth UI library has no screen for that code and always drops a new user on
 * /auth/sign-in, where an unverified account can do nothing — so the app adds
 * its own /auth/verify-email screen and redirects the post-sign-up hop to it.
 * These tests cover that detour and the screen it lands on.
 */

const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
};

test("the verification screen renders and prefills the address from the link", async ({ page }) => {
  const errors = collectErrors(page);

  await page.goto("/auth/verify-email?email=someone%40example.com");

  await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
  await expect(page.locator("#verify-email")).toHaveValue("someone@example.com");
  // Submitting is blocked until a full-length code is present.
  await expect(page.getByRole("button", { name: "Verify email" })).toBeDisabled();
  expect(errors).toEqual([]);
});

test("the code field keeps digits only, up to six of them", async ({ page }) => {
  await page.goto("/auth/verify-email?email=someone%40example.com");
  const codeField = page.locator("#verify-code");

  await codeField.fill("1a2b3c");
  await expect(codeField).toHaveValue("123");
  // Six digits is the whole code, so the field stops there.
  await codeField.fill("");
  await codeField.pressSequentially("1234567");
  await expect(codeField).toHaveValue("123456");
  await expect(page.getByRole("button", { name: "Verify email" })).toBeEnabled();
});

test("a wrong code is refused by the auth server and reported on the form", async ({ page }) => {
  // Hits the real /api/auth/email-otp/verify-email endpoint, which is what
  // proves the screen is wired to the verification call rather than the
  // library's sign-in OTP. Verifying a bogus code changes nothing server-side.
  await page.goto("/auth/verify-email?email=nobody.e2e%40example.com");

  await page.locator("#verify-code").fill("000000");
  await page.getByRole("button", { name: "Verify email" }).click();

  await expect(page.getByRole("status")).toBeVisible();
  // The user stays put with the code cleared, ready to retype.
  await expect(page).toHaveURL(/\/auth\/verify-email/);
  await expect(page.locator("#verify-code")).toHaveValue("");
});

test("sign-up sends the user to the verification screen, not to sign-in", async ({ page }) => {
  const errors = collectErrors(page);
  const email = "e2e-signup@example.com";

  // Stubbed so the test never creates a real account or sends a real email.
  // The body is the shape Neon Auth returns when verification is outstanding:
  // a user, and no session token.
  await page.route("**/api/auth/sign-up/email", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token: null,
        user: { id: "e2e", email, name: "E2E", emailVerified: false },
      }),
    });
  });

  await page.goto("/auth/sign-up");
  await page.locator("input[name=name]").fill("E2E");
  await page.locator("input[name=email]").fill(email);
  await page.locator("input[name=password]").fill("Str0ng-Passw0rd!");
  await page.locator("input[name=confirmPassword]").fill("Str0ng-Passw0rd!");
  await page.getByRole("button", { name: "Create an account" }).click();

  await expect(page).toHaveURL(/\/auth\/verify-email\?/);
  await expect(page.locator("#verify-email")).toHaveValue(email);
  expect(errors).toEqual([]);
});

test("sign-in offers a way in for someone who already has a code", async ({ page }) => {
  await page.goto("/auth/sign-in");

  await page.getByRole("link", { name: "Have a verification code?" }).click();

  await expect(page).toHaveURL(/\/auth\/verify-email/);
  await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
});
