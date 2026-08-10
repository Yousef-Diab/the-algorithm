import { test, expect } from "@playwright/test";

test("home lists both sections' months", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Month 1", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Part 1", { exact: false }).first()).toBeVisible();
});

test("a lesson renders its prose from the database with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/lesson/m4-03");
  await expect(page.locator(".lesson-hero h1")).toHaveText("Orderblocks");
  await expect(page.locator(".lesson-hero .crumb")).toHaveText("Month 4 · Lesson 3");
  await expect(page.locator("article.lesson h3").first()).toHaveText("Definition & Validation");
  // CSS Modules hash Callout's class (e.g. "Callout-module__x__callout"), so an
  // exact ".callout" token selector never matches a real page — substring-match
  // the class attribute instead, same reasoning as the render-blocks unit test's
  // decision to assert structure/text rather than exact hashed class names.
  await expect(page.locator('article.lesson [class*="callout"]')).toHaveCount(1);
  await expect(page.locator(".lesson-video")).toHaveAttribute("href", /^https?:\/\//);
  expect(errors).toEqual([]);
});

test("every lesson in the catalog renders a hero and some body", async ({ page, request }) => {
  // The sidebar is the catalog's own view of itself — walk it.
  await page.goto("/lesson/m1-01");
  const hrefs = await page.locator("nav a[href^='/lesson/']").evaluateAll((as) =>
    (as as HTMLAnchorElement[]).map((a) => a.getAttribute("href")!),
  );
  expect(hrefs.length).toBe(82);

  for (const href of hrefs) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    const html = await res.text();
    expect(html, href).toContain('class="lesson-hero"');
  }
});

test("the review and exam pages render", async ({ page }) => {
  await page.goto("/lesson/s1-review");
  await expect(page.locator(".lesson-hero h1")).toContainText("Section Summary");
  await page.goto("/lesson/s2-exam");
  await expect(page.locator(".lesson-hero h1")).toHaveText("Final Exam");
});
