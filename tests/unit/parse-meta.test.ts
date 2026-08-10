import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseObjs, parseQuiz } from "@/lib/content/parse-meta";

describe("parseObjs", () => {
  it("reads the string fields of every object literal", () => {
    expect(parseObjs(`{ id:"s1", short:"ICT Core", title:"T", desc:"D" }`)).toEqual([
      { id: "s1", short: "ICT Core", title: "T", desc: "D" },
    ]);
  });

  it("survives a formatter turning the literal into a block statement", () => {
    expect(parseObjs(`{\n  id: "s2",\n  label: "Part",\n};\n`)).toEqual([{ id: "s2", label: "Part" }]);
  });

  it("reads many objects, in order", () => {
    expect(parseObjs(`{id:"m1",title:"A"}\n{id:"m2",title:"B"}`).map((o) => o.id)).toEqual(["m1", "m2"]);
  });

  it("reads the real section.js and months.js", () => {
    const s = parseObjs(readFileSync("content/s1-ict-core/section.js", "utf8"));
    expect(s[0].id).toBe("s1");
    expect(parseObjs(readFileSync("content/s1-ict-core/months.js", "utf8"))).toHaveLength(4);
    expect(parseObjs(readFileSync("content/s2-2022-mentorship/months.js", "utf8"))).toHaveLength(6);
    expect(parseObjs(readFileSync("content/s2-2022-mentorship/section.js", "utf8"))[0].label).toBe("Part");
  });
});

describe("parseQuiz", () => {
  it("reads a question array", () => {
    expect(
      parseQuiz(`[
  { q:"why?", o:["a","b","c","d"], a:1, e:"because" }
]`),
    ).toEqual([{ q: "why?", o: ["a", "b", "c", "d"], a: 1, e: "because" }]);
  });

  it("tolerates a formatter-appended semicolon", () => {
    expect(parseQuiz(`[{ q:"q", o:["a","b","c","d"], a:0, e:"e" }];\n`)).toHaveLength(1);
  });

  it("keeps escaped quotes and apostrophes intact", () => {
    const [row] = parseQuiz(`[{ q:"ICT\\"s point", o:["a","b","c","d"], a:0, e:"it's fine" }]`);
    expect(row.q).toBe('ICT"s point');
    expect(row.e).toBe("it's fine");
  });

  it("throws when a question has the wrong number of options", () => {
    expect(() => parseQuiz(`[{ q:"q", o:["a","b"], a:0, e:"e" }]`)).toThrow(/4 options/);
  });

  it("throws when the answer index is out of range", () => {
    expect(() => parseQuiz(`[{ q:"q", o:["a","b","c","d"], a:4, e:"e" }]`)).toThrow(/answer index/);
  });

  it("reads every real quiz.js and exam.js without throwing", () => {
    // Surveyed counts. Note CLAUDE.md §7 still says the s2 exam has 40
    // questions; the file actually holds 43, so trust the file.
    expect(parseQuiz(readFileSync("content/s1-ict-core/exam.js", "utf8"))).toHaveLength(45);
    expect(parseQuiz(readFileSync("content/s2-2022-mentorship/exam.js", "utf8"))).toHaveLength(43);
  });
});
