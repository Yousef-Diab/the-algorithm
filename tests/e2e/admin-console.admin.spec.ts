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

test("the list renders each row's status toggle and access select with its real current values", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto("/admin");

    // A lesson with a pending draft is rendered TWICE — once in the "Pending
    // review" shortcut group and once in its section group — so every per-row
    // locator must be scoped to one table or it matches both.
    const pending = page.getByTestId("pending-table");

    // The probe is status='draft', access='free'.
    await expect(pending.getByTestId(`status-${id}`)).toHaveText("draft");
    await expect(pending.getByTestId(`access-${id}`)).toHaveText("free");
    await expect(pending.getByTestId(`row-${id}`).locator("select")).toHaveValue("free");

    // A draft row must offer to PUBLISH and must NOT offer to unpublish.
    // Asserting both directions pins the toggle: nextStatus() and
    // statusToggleLabel() cannot disagree, and a row cannot show both.
    // exact:true is REQUIRED here. Playwright matches the accessible name by
    // SUBSTRING by default, so { name: "Publish" } also matches "Unpublish" —
    // the negative assertions below would be unsatisfiable without it.
    const probeRow = pending.getByTestId(`row-${id}`);
    await expect(probeRow.getByRole("button", { name: "Publish", exact: true })).toBeVisible();
    await expect(probeRow.getByRole("button", { name: "Unpublish", exact: true })).toHaveCount(0);

    // ...and a published row must offer the opposite. m1-01 is a real published
    // lesson; this is a READ-ONLY assertion and never clicks, because publishing
    // or unpublishing a real lesson from a test would change what the live site
    // serves.
    const realRow = page.getByTestId("row-m1-01");
    await expect(realRow.getByRole("button", { name: "Unpublish", exact: true })).toBeVisible();
    await expect(realRow.getByRole("button", { name: "Publish", exact: true })).toHaveCount(0);
  } finally {
    await cleanup();
  }
});

/**
 * ACCESS, not status, is what this exercises end to end — deliberately.
 * catalogRows() hard-codes EXPECTED_ROW_COUNT over published lessons and throws
 * on mismatch, and playwright.config.ts runs fullyParallel, so a probe row that
 * became status='published' even momentarily would race unrelated specs. The
 * status toggle's direction is pinned by the label assertions above and by
 * tests/unit/admin-status.test.ts; the status WRITE is covered by
 * tests/unit/admin-actions.test.ts.
 */
test("changing access from the list writes it and the reloaded list shows the new value", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto("/admin");
    // Scoped for the same reason as above: the probe appears in two tables.
    const row = () => page.getByTestId("pending-table").getByTestId(`row-${id}`);
    await expect(row().getByTestId(`access-${id}`)).toHaveText("free");

    // Selecting alone must NOT write — access changes require an explicit
    // Apply, so that a browser-synthesised `change` event (form restoration on
    // reload, autofill, an extension) cannot silently re-gate content.
    await row().locator("select").selectOption("members");
    await expect(row().getByTestId(`access-${id}`)).toHaveText("free");

    await row().getByRole("button", { name: "Apply" }).click();
    await expect(row().getByTestId(`row-result-${id}`)).toContainText("members");

    // Reload: /admin is force-dynamic, so this re-reads the database rather
    // than any cache — the new value appearing here means the write landed.
    await page.goto("/admin");
    await expect(row().getByTestId(`access-${id}`)).toHaveText("members");
    await expect(row().locator("select")).toHaveValue("members");
  } finally {
    await cleanup();
  }
});
});
