import { test, expect } from "@playwright/test";

test("css probe renders every content component with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/dev-css-probe");

  await expect(page.locator(".lesson-hero h1")).toHaveText("Orderblocks");
  await expect(page.locator(".callout")).toHaveCount(3);
  await expect(page.locator(".kv > div")).toHaveCount(2);

  // Structural counts pass even with the rules missing entirely (that's the
  // bug this task actually found — .callout/.kv/.flip-row were absent from
  // the ported stylesheet). Assert computed style too, so a deleted rule
  // fails the test instead of passing silently. Token values read from
  // app/globals.css: --accent #4f8cff, --gold #e8b45a, --red #e2606c,
  // --panel #161b28.
  await expect(page.locator(".callout").first()).toHaveCSS("border-left-color", "rgb(79, 140, 255)"); // --accent
  await expect(page.locator(".callout.rule")).toHaveCSS("border-left-color", "rgb(232, 180, 90)"); // --gold
  await expect(page.locator(".callout.warn")).toHaveCSS("border-left-color", "rgb(226, 96, 108)"); // --red
  await expect(page.locator(".kv")).toHaveCSS("display", "grid");
  await expect(page.locator(".kv > div").first()).toHaveCSS("background-color", "rgb(22, 27, 40)"); // --panel, :nth-child(odd)

  // The ported stylesheet must actually be applied, not merely present.
  const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");

  expect(errors).toEqual([]);
});

test("lightbox opens on click, survives a zoomed click on the image, and closes on a real outside click", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/dev-css-probe");

  // The probe page stacks enough content above the chart (hero, sub-header,
  // list, three callouts, the kv table) that it sits below the fold at the
  // default viewport size — boundingBox() still returns coordinates for an
  // off-screen element, and a raw page.mouse.click() at those coordinates
  // would silently land outside the browser window and hit nothing.
  const chart = page.getByTestId("probe-chart");
  await chart.scrollIntoViewIfNeeded();
  const chartBox = await chart.boundingBox();
  if (!chartBox) throw new Error("probe chart did not render a bounding box");
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
  // 3 steps (~1.95x) the 1200x700 probe image's unclipped bounding rect
  // covers the *entire* viewport including every corner (overflow:auto
  // clips what's drawn, not what getBoundingClientRect() reports), leaving
  // no on-screen point that is genuinely "outside" the image for the next
  // assertion to click. One step still overflows the stage (asserted below)
  // while leaving a real margin.
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
});
