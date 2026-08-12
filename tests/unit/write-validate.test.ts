import { describe, it, expect } from "vitest";
import { assertQuiz, assertMeta, assertSourceRef } from "@/lib/content/write-validate";

describe("assertQuiz", () => {
  const ok = { q: "why?", options: ["a", "b", "c", "d"], answer: 1, explanation: "because" };

  it("accepts a well-formed question and preserves an supplied id", () => {
    const out = assertQuiz([{ ...ok, id: "11111111-1111-1111-1111-111111111111" }]);
    expect(out[0].id).toBe("11111111-1111-1111-1111-111111111111");
    expect(out[0].options).toHaveLength(4);
  });

  it("reports the failing path, like assertBlocks does", () => {
    expect(() => assertQuiz([ok, { ...ok, options: ["a", "b", "c"] }]))
      .toThrow(/question\[1\]: options must be an array of exactly 4 strings/);
  });

  it("rejects an answer index outside the options", () => {
    expect(() => assertQuiz([{ ...ok, answer: 4 }]))
      .toThrow(/question\[0\]: answer must be a 0-based index into options/);
  });
});

describe("assertMeta", () => {
  it("passes through only known keys and validates desc as Inline[]", () => {
    const out = assertMeta({ title: "T", desc: [{ t: "text", v: "d" }], bogus: 1 } as unknown);
    expect(out).toEqual({ title: "T", desc: [{ t: "text", v: "d" }] });
  });

  it("rejects a string desc — desc is Inline[], not text", () => {
    expect(() => assertMeta({ desc: "plain" })).toThrow(/desc: expected an array of inline nodes/);
  });

  it("rejects a slug write outright", () => {
    expect(() => assertMeta({ slug: "m1-01-x" })).toThrow(/slug is not writable/);
  });
});

describe("assertSourceRef", () => {
  it("accepts a path that exists under notes/", () => {
    expect(assertSourceRef("notes/ict-core/INDEX.md", process.cwd())).toBe("notes/ict-core/INDEX.md");
  });

  it("rejects a path outside transcripts/ and notes/", () => {
    expect(() => assertSourceRef("package.json", process.cwd()))
      .toThrow(/sourceRef must be a path under transcripts\/ or notes\//);
  });

  it("rejects a path that does not exist — a citation must point at something", () => {
    expect(() => assertSourceRef("notes/nope-does-not-exist.md", process.cwd()))
      .toThrow(/sourceRef does not exist/);
  });

  it("rejects traversal", () => {
    expect(() => assertSourceRef("notes/../package.json", process.cwd()))
      .toThrow(/sourceRef must be a path under transcripts\/ or notes\//);
  });
});
