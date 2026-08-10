import { test, expect } from "@playwright/test";

test("css probe renders every content component with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/dev-css-probe");

  await expect(page.locator(".lesson-hero h1")).toHaveText("Orderblocks");
  await expect(page.locator(".callout")).toHaveCount(3);
  await expect(page.locator(".kv > div")).toHaveCount(2);

  // The ported stylesheet must actually be applied, not merely present.
  const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");

  expect(errors).toEqual([]);
});
