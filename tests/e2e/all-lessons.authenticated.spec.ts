import { test, expect } from "@playwright/test";
import { catalogRows, type CatalogRow } from "./helpers/catalog";
import { collectErrors } from "./helpers/expect-no-errors";

/**
 * Replaces verify.py's full-catalog sweep, signed in as the E2E member
 * account (hence the .authenticated suffix): the member can see every
 * lesson, so this sweep also covers s2's 42 gated lessons, which an
 * anonymous sweep (tests/e2e/lessons.spec.ts) structurally cannot reach.
 *
 * 82 pages is slow, so the full sweep stays at the request level (status,
 * hero markup, video-link presence — all checkable in the raw HTML) and
 * fires every request in parallel via Promise.all (Playwright spec files
 * can't run async code at module scope without top-level await, which the
 * CJS transform this repo uses does not support — so the "one test per row"
 * shape from the brief becomes one test that parallelizes internally
 * instead of test.describe.configure({ mode: "parallel" }) across many
 * per-row tests).
 *
 * A real page.goto + image decode is reserved for a small named subset
 * chosen to have charts:
 *   - m4-03: a FREE lesson with 20 figures (the same fixture
 *     lightbox.spec.ts and media.spec.ts already use).
 *   - p1-02: a MEMBERS (gated) lesson with charts — the only way to prove a
 *     gated lesson's own images decode, since an anonymous sweep can't reach it.
 */
const CHART_SUBSET = ["m4-03", "p1-02"];

test("every published catalog row renders 200 with a hero and the correct video-link presence", async ({
  request,
}) => {
  const rows: CatalogRow[] = await catalogRows();
  const withVideo = rows.filter((r) => r.videoUrl && r.videoUrl.trim().length > 0);
  const withoutVideo = rows.filter((r) => !r.videoUrl || r.videoUrl.trim().length === 0);

  console.log(
    `[all-lessons] catalog: ${rows.length} rows, ${withVideo.length} with video_url, ${withoutVideo.length} without.`,
  );

  const failures: string[] = [];
  await Promise.all(
    rows.map(async (row) => {
      const res = await request.get(`/lesson/${row.id}`);
      if (res.status() !== 200) {
        failures.push(`${row.id}: status ${res.status()}`);
        return;
      }
      const html = await res.text();
      if (!html.includes('class="lesson-hero"')) {
        failures.push(`${row.id}: missing lesson-hero`);
      }
      const hasVideoLink = html.includes('class="lesson-video"');
      const shouldHaveVideoLink = Boolean(row.videoUrl && row.videoUrl.trim().length > 0);
      if (hasVideoLink !== shouldHaveVideoLink) {
        failures.push(
          `${row.id}: video_url=${JSON.stringify(row.videoUrl)} but lesson-video link presence=${hasVideoLink}`,
        );
      }
    }),
  );

  expect(failures).toEqual([]);
});

for (const id of CHART_SUBSET) {
  test(`${id}'s charts all decode with a non-zero natural width`, async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto(`/lesson/${id}`);
    const imgs = page.locator("figure picture img");
    await expect(imgs.first()).toBeVisible();

    // Same lazy-load-then-decode wait media.spec.ts already uses.
    await imgs.last().scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      const els = Array.from(document.querySelectorAll("figure picture img")) as HTMLImageElement[];
      await Promise.all(
        els.map((img) =>
          img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; }),
        ),
      );
    });

    const sizes = await imgs.evaluateAll((els) =>
      (els as HTMLImageElement[]).map((i) => i.naturalWidth),
    );
    expect(sizes.length, id).toBeGreaterThan(0);
    for (const w of sizes) expect(w, id).toBeGreaterThan(0);

    expect(errors).toEqual([]);
  });
}
