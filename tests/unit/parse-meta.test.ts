import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
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

  it("skips a brace group with no key:\"value\" pairs", () => {
    // Covers the `if (Object.keys(fields).length)` guard: a brace group that
    // matches `/\{[^{}]*\}/` but contains no `key:"value"` pair must not
    // produce a spurious empty row.
    expect(parseObjs(`{ ok }`)).toEqual([]);
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

  it("keeps escaped quotes and apostrophes intact, in both q and e", () => {
    // The corpus contains escaped double quotes inside `e` too, e.g.
    // content/s2-2022-mentorship/exam.js: e: "\"There's absolutely zero…".
    // The earlier version of this test only exercised an apostrophe in `e`,
    // which needs no unescaping and so could not tell `unescape(e[1])` apart
    // from a bare `e[1]`.
    const [row] = parseQuiz(
      `[{ q:"ICT\\"s point", o:["a","b","c","d"], a:0, e:"\\"There's zero\\" here" }]`,
    );
    expect(row.q).toBe('ICT"s point');
    expect(row.e).toBe(`"There's zero" here`);
  });

  it("throws when a question has the wrong number of options", () => {
    expect(() => parseQuiz(`[{ q:"q", o:["a","b"], a:0, e:"e" }]`)).toThrow(/4 options/);
  });

  it("throws when the answer index is out of range", () => {
    expect(() => parseQuiz(`[{ q:"q", o:["a","b","c","d"], a:4, e:"e" }]`)).toThrow(/answer index/);
  });

  it("throws when a question object is missing q", () => {
    expect(() => parseQuiz(`[{ o:["a","b","c","d"], a:0, e:"e" }]`)).toThrow(/missing q\/o\/a\/e/);
  });

  it("throws when a question object is missing e", () => {
    expect(() => parseQuiz(`[{ q:"q", o:["a","b","c","d"], a:0 }]`)).toThrow(/missing q\/o\/a\/e/);
  });

  it("throws when the literal does not start with [", () => {
    expect(() => parseQuiz(`{ q:"q", o:["a","b","c","d"], a:0, e:"e" }`)).toThrow(/must start with \[/);
  });

  it("throws when the array literal contains no questions", () => {
    expect(() => parseQuiz(`[]`)).toThrow(/no questions/);
  });

  it("reads every real quiz.js and exam.js, totalling the surveyed counts", () => {
    // Walks the whole content/ tree so this test actually covers the 78
    // quiz.js files it claims to, not just the two exam.js files — the
    // one-off Step 5 sanity script isn't part of the regression suite.
    const CONTENT = join(process.cwd(), "content");
    let files = 0;
    let questions = 0;
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) {
          walk(p);
        } else if (entry === "quiz.js" || entry === "exam.js") {
          files += 1;
          questions += parseQuiz(readFileSync(p, "utf8")).length;
        }
      }
    };
    walk(CONTENT);
    expect(files).toBe(80);
    expect(questions).toBe(564);

    // Pin the two exams individually. Note CLAUDE.md §7 still says the s2
    // exam has 40 questions; the file actually holds 43, so trust the file.
    expect(parseQuiz(readFileSync("content/s1-ict-core/exam.js", "utf8"))).toHaveLength(45);
    expect(parseQuiz(readFileSync("content/s2-2022-mentorship/exam.js", "utf8"))).toHaveLength(43);
  });
});
