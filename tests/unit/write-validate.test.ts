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

  it("rejects a NEGATIVE answer index too — the lower bound is checked, not just the upper", () => {
    expect(() => assertQuiz([{ ...ok, answer: -1 }]))
      .toThrow(/question\[0\]: answer must be a 0-based index into options/);
  });

  it("rejects two questions carrying the same id — the second upsert would overwrite the first", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    expect(() => assertQuiz([{ ...ok, id }, { ...ok, id }]))
      .toThrow(/question\[1\]: duplicate question id/);
  });
});

describe("assertMeta", () => {
  it("passes through the known keys and validates desc as Inline[]", () => {
    const out = assertMeta({ title: "T", desc: [{ t: "text", v: "d" }] } as unknown);
    expect(out).toEqual({ title: "T", desc: [{ t: "text", v: "d" }] });
  });

  // DELIBERATE BEHAVIOUR CHANGE: an unrecognised key used to be silently
  // dropped, which turned a single typo into an empty patch — and
  // writeLessonMeta reports an empty patch as a successful live write. Reject
  // instead, naming the offender and the writable set.
  it("rejects an unrecognised key instead of dropping it", () => {
    expect(() => assertMeta({ title: "T", bogus: 1 } as unknown))
      .toThrow(/unknown meta key "bogus" — writable keys are title, heading, crumb, desc, videoUrl/);
  });

  it("rejects a near-miss typo of a real key — the phantom-success case", () => {
    expect(() => assertMeta({ titel: "New" } as unknown)).toThrow(/unknown meta key "titel"/);
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
