import { test, expect } from "@playwright/test";

/**
 * Runs as the signed-in MEMBER (see the .authenticated.spec.ts name), not
 * anonymously.
 *
 * Moved 2026-09-01: this spec's outside-click assertion is CALIBRATED to a
 * specific image — it clicks (2, 2) because the still-zoomed m4-03 chart's left
 * edge was measured at ~x:7 in this viewport. s1 stopped being uniformly free
 * (only m1-01..m1-08 are), so m4-03 is now gated and an anonymous run sees no
 * charts at all. Pointing this test at a different free lesson would silently
 * invalidate that calibration, so the lesson stays m4-03 and the VIEWER changes
 * instead. Every assertion, including the geometry, is preserved exactly.
 *
 * Gating itself is not this file's subject — gating.spec.ts and quiz.spec.ts
 * remain anonymous and own that.
 */

// Restored verbatim from tests/e2e/smoke.spec.ts as it existed at commit
// 558547a, before Task 13 deleted app/dev-css-probe (its only host page).
//
// components/lightbox/LightboxProvider.tsx is 263 lines of hand-rebuilt
// pointer/zoom/pan logic (the nextjs-migration port was a 67-line stub), and
// this is the only test that exercises it. It pins three documented traps
// (CLAUDE.md §3): the pointer-capture retarget that makes a real click on a
// zoomed image report e.target as the stage rather than the image
// (hitsImage's getBoundingClientRect fallback), the .lb-stage
// flex:1;min-height:0 clamp that keeps the control panel from moving when
// the image's on-screen size changes, and closing on a genuine outside
// click while surviving a genuine on-image click. Deleting the
// getBoundingClientRect fallback from hitsImage makes this test fail.
//
// Re-enabled by Task 16: media rows and the real chart renderer now exist,
// so this points at a real lesson's rendered chart (`/lesson/m4-03`, which
// has 20 figures) instead of the deleted probe's inline SVG.
test(
  "lightbox opens on click, survives a zoomed click on the image, and closes on a real outside click",
  async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      // /api/quiz/<id> answering 401 to an anonymous visitor is the DESIGNED
      // gate (see tests/e2e/quiz.spec.ts, which asserts exactly that status),
      // and Quiz.tsx handles it by rendering <QuizGate/>. Chromium still logs
      // every 4xx subresource as a console error, so this one line is expected
      // noise on any public lesson page. Narrowed by URL, not by message text,
      // so a 401 from anywhere else still fails this test.
      if (/\/api\/quiz\//.test(m.location().url)) return;
      errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.goto("/lesson/m4-03");

    // The lesson stacks a hero, video link and prose above the gallery, so
    // the first chart sits below the fold at the default viewport size —
    // boundingBox() still returns coordinates for an off-screen element, and
    // a raw page.mouse.click() at those coordinates would silently land
    // outside the browser window and hit nothing.
    const chart = page.locator("figure picture img").first();
    await chart.scrollIntoViewIfNeeded();
    const chartBox = await chart.boundingBox();
    if (!chartBox) throw new Error("lesson chart did not render a bounding box");
    await page.mouse.click(chartBox.x + chartBox.width / 2, chartBox.y + chartBox.height / 2);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const lbImage = dialog.locator("img");
    await expect(lbImage).toBeVisible();

    const panel = page.getByTestId("lightbox-panel");
    const panelBoxBeforeZoom = await panel.boundingBox();
    if (!panelBoxBeforeZoom) throw new Error("lightbox panel did not render a bounding box");

    // Zoom past fit so the stage scrolls — this is what puts the image into
    // pointer-capture territory (LightboxProvider's handlePointerDown only
    // arms drag/capture once zoom > 1). A single 1.25x step is deliberate: at
    // higher zoom steps a wide chart's unclipped bounding rect can cover the
    // *entire* viewport including every corner (overflow:auto clips what's
    // drawn, not what getBoundingClientRect() reports), leaving no on-screen
    // point that is genuinely "outside" the image for the next assertion to
    // click. One step still overflows the stage (asserted below) while
    // leaving a real margin.
    const zoomIn = page.getByRole("button", { name: "Zoom in" });
    await zoomIn.click();

    const stage = page.getByTestId("lightbox-stage");
    const overflowing = await stage.evaluate(
      (el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
    );
    expect(overflowing).toBe(true);

    // TRAP 2: the panel must not move just because the image's on-screen size
    // changed (.lb-stage is flex:1;min-height:0, so it — not the panel —
    // absorbs the extra size).
    const panelBoxAfterZoom = await panel.boundingBox();
    expect(panelBoxAfterZoom?.y).toBe(panelBoxBeforeZoom.y);

    // TRAP 1: a real mouse click on the (now zoomed) image must not close the
    // lightbox, even though the stage is holding a pointer capture that
    // retargets the click's e.target away from the image and onto the stage.
    // Deliberately uses page.mouse.click at real coordinates from
    // boundingBox() — never locator.click() or a synthetic el.click() — a
    // synthetic click reports clientX/Y as 0 and would pass this assertion
    // even against broken code, via hitsImage's zero-coordinate fallback
    // (CLAUDE.md §3: "test close-on-outside-click with real mouse input,
    // never el.click()").
    const imgBox = await lbImage.boundingBox();
    if (!imgBox) throw new Error("lightbox image did not render a bounding box");
    await page.mouse.click(imgBox.x + imgBox.width / 2, imgBox.y + imgBox.height / 2);
    await expect(dialog).toBeVisible();

    // A real click clearly outside the image (and outside the control panel)
    // must still close it. (2, 2) sits in the overlay's own 18px padding,
    // left of the still-zoomed image's left edge (measured ~x:7 in this
    // viewport) and well above/left of the bottom-centered control panel.
    await page.mouse.click(2, 2);
    await expect(dialog).toHaveCount(0);

    expect(errors).toEqual([]);
  }
);
