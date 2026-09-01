import { test, expect } from "@playwright/test";
import { plantPendingDraftRow } from "./helpers/catalog";

/**
 * Runs in the "admin" project (tests/e2e/admin.setup.ts, storageState
 * tests/e2e/.auth/admin.json). *.admin.spec.ts is excluded from the anonymous
 * chromium project by playwright.config.ts's testIgnore.
 *
 * All four tests plant the SAME fixed-id probe row (plantPendingDraftRow
 * always uses PENDING_PROBE_ID) and playwright.config.ts sets
 * fullyParallel:true, so without serialization two of these tests would race
 * each other's insert against `lessons_pkey` and fail for the wrong reason
 * (verified directly: running them unserialized threw
 * "duplicate key value violates unique constraint lessons_pkey"). serial()
 * forces them onto one worker, one after another, so each test's `finally`
 * cleanup completes before the next test's plant runs.
 */
test.describe.serial("admin console happy path", () => {
test("the list shows a pending draft under Pending review", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto("/admin");
    await expect(page.getByTestId("pending-table")).toBeVisible();
    await expect(page.getByTestId("pending-table").getByText(id)).toBeVisible();
  } finally {
    await cleanup();
  }
});

test("the review page renders both bodies with change markers", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto(`/admin/lesson/${id}`);
    await expect(page.getByTestId("diff")).toBeVisible();
    await expect(page.getByText("LIVE probe paragraph").first()).toBeVisible();
    await expect(page.getByText("DRAFT probe paragraph")).toBeVisible();
    // The draft adds one paragraph, so exactly one row must be marked added.
    await expect(page.locator('[data-tag="added"]')).toHaveCount(1);
    await expect(page.locator('[data-tag="same"]')).toHaveCount(1);
  } finally {
    await cleanup();
  }
});

test("promote moves the draft into the live body and clears the draft columns", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto(`/admin/lesson/${id}`);
    await page.getByRole("button", { name: "Promote draft" }).click();
    await expect(page.getByTestId("promote-result")).toContainText("promoted");

    await page.goto(`/admin/lesson/${id}`);
    await expect(page.getByTestId("no-draft")).toBeVisible();
    await expect(page.getByText("DRAFT probe paragraph")).toBeVisible();
  } finally {
    await cleanup();
  }
});

test("discard requires the typed id and then clears the draft, leaving the live body", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto(`/admin/lesson/${id}`);
    const button = page.getByRole("button", { name: "Discard draft" });
    await expect(button, "the discard button must stay disabled until the id is typed").toBeDisabled();

    await page.locator("#confirm").fill(id);
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.getByTestId("discard-result")).toContainText("discarded");

    await page.goto(`/admin/lesson/${id}`);
    await expect(page.getByTestId("no-draft")).toBeVisible();
    await expect(page.getByText("LIVE probe paragraph")).toBeVisible();
    await expect(page.getByText("DRAFT probe paragraph")).toHaveCount(0);
  } finally {
    await cleanup();
  }
});
});
