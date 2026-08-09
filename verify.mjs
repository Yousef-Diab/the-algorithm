// verify.mjs — headless smoke test for the built site (dist/).
// Mirrors the checks verify.py used to run: every lesson page exists and
// renders, quizzes grade and reset, the lightbox opens/zooms/navigates,
// exams submit with a score, themes switch, and there are zero console
// errors. Run: pnpm verify (after pnpm build).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const DIST = join(process.cwd(), "dist");
// Base path must match the one baked into the build (see astro.config.mjs):
// "/the-algorithm" for GitHub Pages, "" (root) for Coolify builds. Setting
// BASE_PATH at verify time keeps the checks aligned with the built site.
const BASE = (process.env.BASE_PATH ?? "/the-algorithm").replace(/\/+$/, "");
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

/* ---------------- static server over dist/ (strips the base path) ------ */

function serve() {
  return createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.startsWith(BASE)) {
      p = p.slice(BASE.length);
    }
    if (p === "" || p === "/") {
      p = "/index.html";
    }
    let file = join(DIST, normalize(p));
    if (!file.startsWith(DIST)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) {
      file = join(DIST, p, "index.html");
    }
    if (!existsSync(file)) {
      file = join(DIST, "404.html");
    }
    res.writeHead(200, {
      "Content-Type": MIME[extname(file)] || "application/octet-stream",
    });
    res.end(readFileSync(file));
  });
}

/* ---------------- expectations derived from content/ -------------------- */

const SPLIT_RE = /[\\/]/;
const SEMI_BRACE_RE = /;\s*}/g;
const SEMI_END_RE = /;\s*$/;
const SLUG_RE = /data-slug="([^"]+)"/;
const TITLE_RE = /data-title="([^"]+)"/;
const ID_RE = /id\s*:\s*["']([^"']+)["']/;
const CHART_FILE_RE = /^(.+)-(\d{2})\.png$/;

const parts = (p) => p.split(SPLIT_RE).filter(Boolean);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const contentFiles = walk(join(process.cwd(), "content"));
const sectionIdByDir = new Map(); // content dir -> section id
for (const f of contentFiles.filter((x) => x.endsWith("section.js"))) {
  const m = readFileSync(f, "utf8").match(ID_RE);
  if (m) {
    sectionIdByDir.set(parts(f).at(-2), m[1]);
  }
}

const lessons = contentFiles.filter((f) => f.endsWith("lesson.html"));
const videoFiles = contentFiles.filter(
  (f) => f.endsWith("video.txt") && readFileSync(f, "utf8").trim().length > 0
);
const summaryFiles = contentFiles.filter((f) => f.endsWith("summary.html"));
const examFiles = contentFiles.filter((f) => f.endsWith("exam.js"));

const parseArr = (file) => {
  const src = readFileSync(file, "utf8")
    .trim()
    .replace(SEMI_BRACE_RE, "}")
    .replace(SEMI_END_RE, "");
  return new Function(`return (${src});`)();
};

// slug -> expected chart count (max NN seen in images/)
const chartCounts = new Map();
for (const f of walk(join(process.cwd(), "images"))) {
  const m = parts(f).at(-1).match(CHART_FILE_RE);
  if (!m) {
    continue;
  }
  const n = Number(m[2]);
  if (!chartCounts.has(m[1]) || chartCounts.get(m[1]) < n) {
    chartCounts.set(m[1], n);
  }
}

const lessonExpect = lessons.map((f) => {
  const p = parts(f);
  const html = readFileSync(f, "utf8");
  const id = p.at(-2);
  const [, slug] = html.match(SLUG_RE) || [];
  const [, title = ""] = html.match(TITLE_RE) || [];
  return {
    charts: slug ? chartCounts.get(slug) || 0 : 0,
    id,
    month: p.at(-2).slice(0, 2),
    quiz: parseArr(join(dirname(f), "quiz.js")),
    section: sectionIdByDir.get(p.at(-4)),
    title,
    video: videoFiles.some((v) => parts(v).at(-2) === id),
  };
});
const examExpect = examFiles.map((f) => ({
  questions: parseArr(f),
  section: sectionIdByDir.get(parts(f).at(-2)),
}));

/* ---------------- run --------------------------------------------------- */

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`  ✗ ${msg}`);
};
const ok = (msg) => console.log(`  ✓ ${msg}`);

const server = serve();
await new Promise((r) => server.listen(0, r));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = (p) => `${origin}${BASE}${p}`;

console.log("Routes…");
const routes = ["/", "/course"];
for (const f of summaryFiles) {
  routes.push(`/course/${sectionIdByDir.get(parts(f).at(-2))}/review`);
}
for (const f of examFiles) {
  routes.push(`/course/${sectionIdByDir.get(parts(f).at(-2))}/exam`);
}
for (const f of lessons) {
  const p = parts(f);
  routes.push(
    `/course/${sectionIdByDir.get(p.at(-3))}/${p.at(-2).slice(0, 2)}/${p.at(-2)}`
  );
}
for (const r of routes) {
  const res = await fetch(url(r));
  if (res.status !== 200) {
    fail(`route ${r} -> ${res.status}`);
  }
}
ok(`${routes.length} routes return 200`);

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") {
    errors.push(`console.error: ${m.text()}`);
  }
});

console.log("Landing…");
await page.goto(url("/"));
if (!(await page.locator(".home-hero h1").count())) {
  fail("landing hero missing");
}
const startHref = await page.locator("a.start").first().getAttribute("href");
if (startHref !== `${BASE}/course`) {
  fail(`start href = ${startHref}`);
}
ok("hero + start button");

console.log("Theme toggle…");
await page.goto(url("/course"));
await page.click(".theme-btn");
await page.locator(".theme-menu button", { hasText: "Dark" }).click();
const dark = await page.evaluate(() =>
  document.documentElement.getAttribute("data-theme")
);
if (dark !== "trading") {
  fail(`dark theme -> ${dark}`);
}
const stored = await page.evaluate(() => localStorage.getItem("ict-theme"));
if (stored !== "dark") {
  fail(`ict-theme stored = ${stored}`);
}
await page.reload();
const afterReload = await page.evaluate(() =>
  document.documentElement.getAttribute("data-theme")
);
if (afterReload !== "trading") {
  fail(`theme after reload -> ${afterReload}`);
}
await page.click(".theme-btn");
await page.locator(".theme-menu button", { hasText: "System" }).click();
await page.evaluate(() => localStorage.removeItem("ict-theme"));
ok("light/dark/system switching + persistence");

console.log("Course page…");
const mcardCount = await page.locator(".mcard").count();
if (mcardCount < 6) {
  fail(`month cards = ${mcardCount}`);
}
const secHeads = await page.locator(".sec-head").count();
if (secHeads !== 2) {
  fail(`sec-heads = ${secHeads}`);
}
if (!(await page.locator(".reset-panel").count())) {
  fail("reset panel missing");
}
ok(`month cards (${mcardCount}) + reset panel`);

console.log("Lessons…");
for (const exp of lessonExpect) {
  await page.goto(url(`/course/${exp.section}/${exp.month}/${exp.id}`));
  const h1 = (await page.locator(".lesson h1").textContent()) || "";
  if (h1.trim() !== exp.title) {
    fail(`${exp.id}: h1 "${h1.trim()}" != "${exp.title}"`);
  }
  const figs = await page.locator(".fig img").count();
  if (figs !== exp.charts) {
    fail(`${exp.id}: figs ${figs} != ${exp.charts}`);
  }
  const broken = await page
    .locator(".fig img")
    .evaluateAll((imgs) => imgs.filter((i) => i.naturalWidth === 0).length);
  if (broken > 0) {
    fail(`${exp.id}: ${broken} broken charts`);
  }
  const qs = await page.locator(".quiz .q").count();
  if (qs !== exp.quiz.length) {
    fail(`${exp.id}: questions ${qs} != ${exp.quiz.length}`);
  }
  for (let i = 0; i < qs; i += 1) {
    const opts = await page.locator(".quiz .q").nth(i).locator(".opt").count();
    if (opts !== 4) {
      fail(`${exp.id} q${i}: ${opts} options`);
    }
  }
  if (qs > 0) {
    await page.locator(".quiz").first().scrollIntoViewIfNeeded();
    await page
      .waitForFunction(
        () => {
          const el = document.querySelector(".quiz .opt");
          return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
        },
        undefined,
        { timeout: 10_000 }
      )
      .catch(() => fail(`${exp.id}: quiz island never hydrated`));
    await page.locator(".quiz .q").first().locator(".opt").first().click();
    const correct = await page
      .locator(".quiz .q")
      .first()
      .locator(".opt.correct")
      .count();
    const expl = await page
      .locator(".quiz .q")
      .first()
      .locator(".expl.show")
      .count();
    if (correct !== 1) {
      fail(`${exp.id}: grading -> ${correct} correct`);
    }
    if (expl !== 1) {
      fail(`${exp.id}: explanation not shown`);
    }
    const resetEnabled = await page.locator(".mini-btn").isEnabled();
    if (!resetEnabled) {
      fail(`${exp.id}: reset disabled after answer`);
    }
    await page.locator(".mini-btn").click();
    const graded = await page.locator(".quiz .opt.correct").count();
    if (graded !== 0) {
      fail(`${exp.id}: reset did not clear grading`);
    }
  }
  const hasVideo = (await page.locator(".lesson-video").count()) > 0;
  if (hasVideo !== exp.video) {
    fail(`${exp.id}: video link mismatch`);
  }
  if (!(await page.locator(".notes-area").count())) {
    fail(`${exp.id}: notes box missing`);
  }
  if (!(await page.locator(".save-btn").count())) {
    fail(`${exp.id}: notes save button missing`);
  }
  if (!(await page.locator(".clear-btn").count())) {
    fail(`${exp.id}: notes clear button missing`);
  }
}
ok(
  `${lessonExpect.length} lessons: titles, charts, quizzes (4 opts, grade, reset), videos, notes`
);

console.log("Lightbox…");
const [chartLesson] = lessonExpect
  .filter((l) => l.charts >= 2)
  .sort((a, b) => b.charts - a.charts);
if (chartLesson) {
  await page.goto(
    url(`/course/${chartLesson.section}/${chartLesson.month}/${chartLesson.id}`)
  );
  await page
    .waitForFunction(() => document.documentElement.dataset.lbReady === "true")
    .catch(() => fail("lightbox island never hydrated"));
  await page.locator(".fig img").first().click();
  await page.waitForTimeout(300);
  if (!(await page.locator(".yarl__portal_open").count())) {
    fail("lightbox did not open");
  }
  if (
    !(await page.evaluate(() =>
      document.body.classList.contains("yarl__no_scroll")
    ))
  ) {
    fail("body not locked");
  }
  // Verify navigation buttons exist and clicking next keeps the lightbox open.
  if (!(await page.locator(".yarl__navigation_prev").count())) {
    fail("prev button missing");
  }
  if (!(await page.locator(".yarl__navigation_next").count())) {
    fail("next button missing");
  }
  await page.click(".yarl__navigation_next");
  await page.waitForTimeout(400);
  if (!(await page.locator(".yarl__portal_open").count())) {
    fail("lightbox closed after next click");
  }
  // Check that the zoom-in toolbar button exists (zoom plugin is active).
  const zoomInBtn = page.locator(".yarl__toolbar button[aria-label='Zoom in']");
  if (!(await zoomInBtn.count())) {
    fail("zoom-in button missing");
  }
  // Close with Escape.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  if (await page.locator(".yarl__portal_open").count()) {
    fail("Escape did not close");
  }
  // Re-open via click and close again.
  await page.locator(".fig img").first().click();
  await page.waitForTimeout(300);
  if (!(await page.locator(".yarl__portal_open").count())) {
    fail("lightbox did not re-open");
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  if (await page.locator(".yarl__portal_open").count()) {
    fail("Escape did not close on re-open");
  }
  ok("open / navigation / zoom button / close / re-open behaviors");
} else {
  fail("no lesson with >= 2 charts found");
}

console.log("Exams…");
for (const exp of examExpect) {
  await page.goto(url(`/course/${exp.section}/exam`));
  const qs = await page.locator(".exam .q").count();
  if (qs !== exp.questions.length) {
    fail(`${exp.section}: questions ${qs} != ${exp.questions.length}`);
  }
  await page.locator(".exam").first().scrollIntoViewIfNeeded();
  await page
    .waitForFunction(
      () => {
        const el = document.querySelector(".exam .opt");
        return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
      },
      undefined,
      { timeout: 10_000 }
    )
    .catch(() => fail(`${exp.section}: exam island never hydrated`));
  for (let i = 0; i < qs; i += 1) {
    const opts = await page.locator(".exam .q").nth(i).locator(".opt").count();
    if (opts !== 4) {
      fail(`${exp.section} q${i}: ${opts} options`);
    }
  }
  const badge = await page.locator(".exam-best").textContent();
  if (!badge.includes("Not attempted yet")) {
    fail(`${exp.section}: badge = "${badge}"`);
  }
  const submitDisabled0 = await page
    .locator(".exam-actions .primary")
    .isDisabled();
  if (!submitDisabled0) {
    fail(`${exp.section}: submit enabled with 0 answers`);
  }
  for (let i = 0; i < qs; i += 1) {
    const q = exp.questions[i];
    const texts = await page
      .locator(".exam .q")
      .nth(i)
      .locator(".opt")
      .allTextContents();
    const k = texts.findIndex((t) => t.trim() === q.o[q.a].trim());
    if (k === -1) {
      fail(`${exp.section} q${i}: correct option not found`);
      continue;
    }
    await page.locator(".exam .q").nth(i).locator(".opt").nth(k).click();
  }
  await page.click(".exam-actions .primary");
  await page.waitForTimeout(100);
  const score = (await page.locator(".exam-score").textContent()) || "";
  if (!/^\d+%$/.test(score.trim())) {
    fail(`${exp.section}: score = "${score}"`);
  }
  if (score.trim() !== "100%") {
    fail(`${exp.section}: expected 100%, got ${score.trim()}`);
  }
  if (!(await page.locator(".exam-score.pass").count())) {
    fail(`${exp.section}: not marked pass`);
  }
  if (
    !(await page.locator(".exam-actions .btn", { hasText: "Retake" }).count())
  ) {
    fail(`${exp.section}: retake missing`);
  }
  await page.locator(".exam-actions .btn", { hasText: "Retake" }).click();
  await page.waitForTimeout(50);
  const picked = await page.locator(".exam .opt.picked").count();
  if (picked !== 0) {
    fail(`${exp.section}: picks not cleared on retake`);
  }
  // After a retake nothing is answered, so submit is disabled again (0/m).
  const submitDisabled = await page
    .locator(".exam-actions .primary")
    .isDisabled();
  if (!submitDisabled) {
    fail(`${exp.section}: submit should be disabled after retake`);
  }
}
ok(
  `${examExpect.length} exams: 4 opts, full-answer submit -> 100% pass, retake`
);

console.log("Summary vs exam counts…");
// A section summary states its exam's question count in prose, and nothing
// else couples the two — they have drifted before. Check the stated number
// against the exam that actually renders.
const SUMMARY_EXAM_COUNT_RE = /Final Exam.{0,80}?(\d+)\s+questions?/s;
for (const f of summaryFiles) {
  const sec = sectionIdByDir.get(parts(f).at(-2));
  const m = readFileSync(f, "utf8").match(SUMMARY_EXAM_COUNT_RE);
  if (!m) {
    continue; // summary states no count — fine
  }
  const stated = Number(m[1]);
  const exam = examExpect.find((e) => e.section === sec);
  if (!exam) {
    fail(
      `${sec}: summary.html states ${stated} question(s) but no exam.js exists`
    );
    continue;
  }
  if (stated !== exam.questions.length) {
    fail(
      `${sec}: summary.html says ${stated}, exam.js has ${exam.questions.length}`
    );
  }
}
ok("summary-stated exam question counts match the rendered exams");

console.log("Review pages…");
for (const f of summaryFiles) {
  const sec = sectionIdByDir.get(parts(f).at(-2));
  await page.goto(url(`/course/${sec}/review`));
  const h1 = (await page.locator(".lesson h1").textContent()) || "";
  if (h1.trim() !== "Section Summary") {
    fail(`${sec}: review h1 = "${h1.trim()}"`);
  }
  const bodyLen = await page
    .locator(".lesson")
    .first()
    .evaluate((el) => el.textContent.length);
  if (bodyLen < 500) {
    fail(`${sec}: review body too short (${bodyLen})`);
  }
}
ok(`${summaryFiles.length} review pages render`);

console.log("Console…");
if (errors.length) {
  for (const e of errors.slice(0, 10)) {
    fail(e);
  }
} else {
  ok("zero page/console errors");
}

await browser.close();
server.close();
console.log(
  failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`
);
process.exit(failures === 0 ? 0 : 1);
