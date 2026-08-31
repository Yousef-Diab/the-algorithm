import { describe, it, expect } from "vitest";
import { groupLessons, type ConsoleLessonRow } from "@/lib/admin/group-lessons";

function row(over: Partial<ConsoleLessonRow>): ConsoleLessonRow {
  return {
    id: "m1-01",
    title: "T",
    access: "free",
    status: "published",
    hasDraft: false,
    writeOrigin: "import",
    sourceRef: null,
    sectionId: "s1",
    monthId: "m1",
    kind: "lesson",
    ...over,
  };
}

describe("groupLessons", () => {
  it("lifts every lesson with a pending draft into `pending`, in input order", () => {
    const g = groupLessons([
      row({ id: "m1-01" }),
      row({ id: "m1-02", hasDraft: true }),
      row({ id: "m2-01", monthId: "m2", hasDraft: true }),
    ]);
    expect(g.pending.map((l) => l.id)).toEqual(["m1-02", "m2-01"]);
  });

  it("still lists a pending lesson in its section tree — `pending` is a shortcut, not a move", () => {
    const g = groupLessons([row({ id: "m1-02", hasDraft: true })]);
    expect(g.sections[0].months[0].lessons.map((l) => l.id)).toEqual(["m1-02"]);
  });

  it("groups by section then month, preserving input order at both levels", () => {
    const g = groupLessons([
      row({ id: "m1-01", monthId: "m1" }),
      row({ id: "m2-01", monthId: "m2" }),
      row({ id: "p1-01", sectionId: "s2", monthId: "p1" }),
    ]);
    expect(g.sections.map((s) => s.sectionId)).toEqual(["s1", "s2"]);
    expect(g.sections[0].months.map((m) => m.monthId)).toEqual(["m1", "m2"]);
    expect(g.sections[1].months.map((m) => m.monthId)).toEqual(["p1"]);
  });

  it("puts null-month lessons under their section, not in a month group", () => {
    const g = groupLessons([
      row({ id: "m1-01", monthId: "m1" }),
      row({ id: "s1-exam", monthId: null, kind: "exam" }),
      row({ id: "s1-review", monthId: null, kind: "review" }),
    ]);
    expect(g.sections[0].months.map((m) => m.monthId)).toEqual(["m1"]);
    expect(g.sections[0].sectionLevel.map((l) => l.id)).toEqual(["s1-review", "s1-exam"]);
  });

  it("never creates a month group named null", () => {
    const g = groupLessons([row({ id: "s1-exam", monthId: null, kind: "exam" })]);
    for (const s of g.sections) {
      for (const m of s.months) expect(m.monthId).not.toBeNull();
      expect(s.months).toHaveLength(0);
    }
  });

  it("drops no lesson — every input appears exactly once in the section tree", () => {
    const rows = [
      row({ id: "m1-01", monthId: "m1" }),
      row({ id: "s1-review", monthId: null, kind: "review" }),
      row({ id: "p1-01", sectionId: "s2", monthId: "p1", hasDraft: true }),
      row({ id: "s2-exam", sectionId: "s2", monthId: null, kind: "exam" }),
    ];
    const g = groupLessons(rows);
    const seen = g.sections.flatMap((s) => [...s.months.flatMap((m) => m.lessons), ...s.sectionLevel]);
    expect(seen.map((l) => l.id).sort()).toEqual(["m1-01", "p1-01", "s1-review", "s2-exam"]);
  });

  it("returns empty structures for no input", () => {
    expect(groupLessons([])).toEqual({ pending: [], sections: [] });
  });
});
