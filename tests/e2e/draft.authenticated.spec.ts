import { test, expect } from "@playwright/test";
import { plantDraft } from "./helpers/catalog";

const FREE = "m1-01";
const MARKER = "DRAFT-MARKER-MUST-NEVER-BE-SERVED";

test("a pending draft is invisible to a signed-in member too", async ({ page }) => {
  const cleanup = await plantDraft(FREE, MARKER);
  try {
    await page.goto(`/lesson/${FREE}`);
    await expect(page.locator("h2").first()).toBeVisible();
    expect(await page.content()).not.toContain(MARKER);
  } finally {
    await cleanup();
  }
});
