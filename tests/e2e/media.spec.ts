import { test, expect } from "@playwright/test";

test("a lesson's charts load through the media route", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/api/media/") && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });

  await page.goto("/lesson/m4-03");
  const imgs = page.locator("figure picture img");
  await expect(imgs.first()).toBeVisible();

  // Charts render with explicit width/height (no CLS), so the box is visible
  // before the bytes arrive. Scroll the whole gallery into view to trigger
  // every `loading="lazy"` fetch, then wait for each <img> to finish
  // decoding before reading natural dimensions.
  await imgs.last().scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    const els = Array.from(document.querySelectorAll("figure picture img")) as HTMLImageElement[];
    await Promise.all(
      els.map((img) => (img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; }))),
    );
  });

  // Every rendered chart decoded — no broken images, no zero-size boxes.
  const sizes = await imgs.evaluateAll((els) =>
    (els as HTMLImageElement[]).map((i) => ({ w: i.naturalWidth, h: i.naturalHeight, src: i.getAttribute("src") })),
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const s of sizes) {
    expect(s.src, "chart src must be the media route, never an R2 URL").toMatch(/^\/api\/media\/[0-9a-f-]{36}$/);
    expect(s.w, JSON.stringify(s)).toBeGreaterThan(0);
  }
  expect(failed).toEqual([]);
});

test("the media route 404s an unknown or malformed id", async ({ request }) => {
  expect((await request.get("/api/media/not-a-uuid")).status()).toBe(404);
  expect((await request.get("/api/media/11111111-1111-1111-1111-111111111111")).status()).toBe(404);
});

test("intrinsic dimensions are emitted so there is no layout shift", async ({ page }) => {
  await page.goto("/lesson/m4-03");
  const attrs = await page.locator("figure picture img").first().evaluate((el) => ({
    w: el.getAttribute("width"),
    h: el.getAttribute("height"),
  }));
  expect(Number(attrs.w)).toBeGreaterThan(0);
  expect(Number(attrs.h)).toBeGreaterThan(0);
});
