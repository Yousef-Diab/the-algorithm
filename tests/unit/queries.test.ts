import { describe, it, expect } from "vitest";
import { lessonOrder, type CatalogSection, type CatalogLesson } from "@/lib/content/queries";

function makeLesson(id: string, ord: number): CatalogLesson {
  return { id, title: id, desc: "", kind: "lesson", access: "members", ord };
}

describe("lessonOrder", () => {
  it("flattens months in order, then appends review then exam, per section, sections in order", () => {
    const catalog: CatalogSection[] = [
      {
        id: "s1",
        short: "s1",
        title: "Section 1",
        desc: "",
        label: "Month",
        months: [
          { id: "m1", title: "Month 1", desc: "", lessons: [makeLesson("m1-01", 1), makeLesson("m1-02", 2)] },
          { id: "m2", title: "Month 2", desc: "", lessons: [makeLesson("m2-01", 1)] },
        ],
        review: { id: "s1-review", title: "Review", desc: "", kind: "review", access: "members", ord: 999 },
        exam: { id: "s1-exam", title: "Exam", desc: "", kind: "exam", access: "members", ord: 1000 },
      },
      {
        id: "s2",
        short: "s2",
        title: "Section 2",
        desc: "",
        label: "Part",
        months: [{ id: "m3", title: "Part 1", desc: "", lessons: [makeLesson("m3-01", 1)] }],
        review: { id: "s2-review", title: "Review", desc: "", kind: "review", access: "members", ord: 999 },
        exam: { id: "s2-exam", title: "Exam", desc: "", kind: "exam", access: "members", ord: 1000 },
      },
    ];

    expect(lessonOrder(catalog)).toEqual([
      "m1-01",
      "m1-02",
      "m2-01",
      "s1-review",
      "s1-exam",
      "m3-01",
      "s2-review",
      "s2-exam",
    ]);
  });

  it("omits a missing review or exam rather than emitting undefined", () => {
    const catalog: CatalogSection[] = [
      {
        id: "s1",
        short: "s1",
        title: "Section 1",
        desc: "",
        label: "Month",
        months: [{ id: "m1", title: "Month 1", desc: "", lessons: [makeLesson("m1-01", 1)] }],
        // review and exam both absent
      },
    ];

    expect(lessonOrder(catalog)).toEqual(["m1-01"]);
    expect(lessonOrder(catalog)).not.toContain(undefined);
  });

  it("omits just the missing one when only review or only exam is present", () => {
    const withReviewOnly: CatalogSection[] = [
      {
        id: "s1",
        short: "s1",
        title: "Section 1",
        desc: "",
        label: "Month",
        months: [{ id: "m1", title: "Month 1", desc: "", lessons: [makeLesson("m1-01", 1)] }],
        review: { id: "s1-review", title: "Review", desc: "", kind: "review", access: "members", ord: 999 },
      },
    ];
    expect(lessonOrder(withReviewOnly)).toEqual(["m1-01", "s1-review"]);

    const withExamOnly: CatalogSection[] = [
      {
        id: "s1",
        short: "s1",
        title: "Section 1",
        desc: "",
        label: "Month",
        months: [{ id: "m1", title: "Month 1", desc: "", lessons: [makeLesson("m1-01", 1)] }],
        exam: { id: "s1-exam", title: "Exam", desc: "", kind: "exam", access: "members", ord: 1000 },
      },
    ];
    expect(lessonOrder(withExamOnly)).toEqual(["m1-01", "s1-exam"]);
  });

  it("returns an empty array for an empty catalog", () => {
    expect(lessonOrder([])).toEqual([]);
  });
});
