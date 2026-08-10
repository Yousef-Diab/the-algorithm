// tests/unit/import.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readContentTree } from "@/lib/content/import";

const plan = readContentTree("content");

describe("readContentTree", () => {
  it("finds both sections with their label nouns", () => {
    expect(plan.sections.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(plan.sections.find((s) => s.id === "s1")?.label).toBe("Month");
    expect(plan.sections.find((s) => s.id === "s2")?.label).toBe("Part");
  });

  it("finds 10 months across the two sections", () => {
    expect(plan.months.filter((m) => m.sectionId === "s1")).toHaveLength(4);
    expect(plan.months.filter((m) => m.sectionId === "s2")).toHaveLength(6);
  });

  it("produces 78 lessons, 2 reviews and 2 exams", () => {
    const byKind = (k: string) => plan.lessons.filter((l) => l.kind === k);
    expect(byKind("lesson")).toHaveLength(78);
    expect(byKind("review")).toHaveLength(2);
    expect(byKind("exam")).toHaveLength(2);
  });

  it("attaches a month to lessons and none to reviews/exams", () => {
    expect(plan.lessons.filter((l) => l.kind === "lesson").every((l) => l.monthId !== null)).toBe(true);
    expect(plan.lessons.filter((l) => l.kind !== "lesson").every((l) => l.monthId === null)).toBe(true);
  });

  it("gives every lesson a unique non-empty slug", () => {
    const slugs = plan.lessons.filter((l) => l.kind === "lesson").map((l) => l.slug);
    expect(slugs.every(Boolean)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("reads the video url where video.txt is non-empty", () => {
    const withVideo = plan.lessons.filter((l) => l.videoUrl);
    expect(withVideo.length).toBeGreaterThan(0);
    expect(withVideo.every((l) => l.videoUrl!.startsWith("http"))).toBe(true);
  });

  it("attaches quiz questions to lessons and exam questions to the exam rows", () => {
    expect(plan.lessons.filter((l) => l.kind === "lesson").every((l) => l.questions.length > 0)).toBe(true);
    const s2exam = plan.lessons.find((l) => l.id === "s2-exam");
    expect(s2exam?.questions).toHaveLength(43);
    expect(s2exam?.body).toEqual([]);
    expect(plan.lessons.reduce((n, l) => n + l.questions.length, 0)).toBe(564);
  });

  it("orders reviews and exams last within their section", () => {
    const s1 = plan.lessons.filter((l) => l.sectionId === "s1").sort((a, b) => a.ord - b.ord);
    expect(s1.at(-2)?.kind).toBe("review");
    expect(s1.at(-1)?.kind).toBe("exam");
  });

  it("produces bodies that pass the block validator", async () => {
    const { assertBlocks } = await import("@/lib/content/blocks");
    for (const l of plan.lessons) expect(() => assertBlocks(l.body)).not.toThrow();
  });
});

describe("readContentTree month/folder guard (R10)", () => {
  let fixtureRoot: string | undefined;

  afterEach(() => {
    if (fixtureRoot) rmSync(fixtureRoot, { recursive: true, force: true });
    fixtureRoot = undefined;
  });

  /** A minimal, valid content tree except the lesson's data-month/folder relationship. */
  function buildFixture(lessonDataMonth: string): string {
    const root = mkdtempSync(join(tmpdir(), "import-month-guard-"));
    const secPath = join(root, "s1");
    mkdirSync(secPath, { recursive: true });
    writeFileSync(
      join(secPath, "section.js"),
      `{id:"s1", short:"S1", title:"Section One", desc:"Test section", label:"Month"}`,
    );
    writeFileSync(join(secPath, "months.js"), `[{id:"m1", title:"Month One", desc:"Test month"}]`);

    const lessonPath = join(secPath, "m1", "m1-01");
    mkdirSync(lessonPath, { recursive: true });
    writeFileSync(
      join(lessonPath, "lesson.html"),
      `<section class="lesson" id="m1-01" data-title="Test Lesson" data-month="${lessonDataMonth}">
  <div class="lesson-hero">
    <div class="crumb">Month 1 · Lesson 1</div>
    <h2>Test Lesson</h2>
    <div class="desc">Test description.</div>
  </div>
</section>`,
    );
    writeFileSync(join(lessonPath, "quiz.js"), `[{q:"q?",o:["a","b","c","d"],a:0,e:"because"}]`);
    return root;
  }

  it("throws when a lesson's data-month disagrees with its folder", () => {
    fixtureRoot = buildFixture("m2");
    expect(() => readContentTree(fixtureRoot!)).toThrow(/month folder="m1".*data-month="m2"/);
  });

  it("does not throw when data-month agrees with its folder", () => {
    fixtureRoot = buildFixture("m1");
    expect(() => readContentTree(fixtureRoot!)).not.toThrow();
  });
});
