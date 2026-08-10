import { describe, it, expect } from "vitest";
import { planMedia } from "@/lib/content/import-media";
import { readContentTree } from "@/lib/content/import";

const lessons = readContentTree("content").lessons.map((l) => ({ id: l.id, slug: l.slug }));
const plan = planMedia("images", lessons);

describe("planMedia", () => {
  it("finds all 339 chart files", () => {
    expect(plan).toHaveLength(339);
  });

  it("numbers each lesson's charts from 0 in filename order", () => {
    const m403 = plan.filter((p) => p.lessonId === "m4-03").sort((a, b) => a.ord - b.ord);
    expect(m403[0].ord).toBe(0);
    expect(m403.map((p) => p.file)).toEqual([...m403.map((p) => p.file)].sort());
  });

  it("attributes every file to a real lesson", () => {
    const ids = new Set(lessons.map((l) => l.id));
    expect(plan.every((p) => ids.has(p.lessonId))).toBe(true);
  });

  it("leaves no chart file unclaimed", () => {
    // A PNG whose stem matches no lesson slug is an authoring error, not a
    // file to skip silently.
    expect(() => planMedia("images", lessons.slice(0, 1))).toThrow(/no lesson matches/);
  });
});
