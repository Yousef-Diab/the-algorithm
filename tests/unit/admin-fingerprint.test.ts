import { describe, it, expect } from "vitest";
import { canonicalJson, fingerprint } from "@/lib/admin/fingerprint";

describe("canonicalJson", () => {
  it("sorts object keys so key order cannot change the result", () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  it("preserves array order, which is meaningful for blocks", () => {
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it("sorts keys of objects nested inside arrays", () => {
    expect(canonicalJson([{ t: "p", c: [] }])).toBe(canonicalJson([{ c: [], t: "p" }]));
  });

  it("distinguishes null from absent", () => {
    expect(canonicalJson({ a: null })).not.toBe(canonicalJson({}));
  });
});

describe("fingerprint", () => {
  it("is a 64-character lowercase hex sha256", () => {
    expect(fingerprint([{ t: "p", c: [] }])).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is stable across key order", () => {
    expect(fingerprint({ b: 1, a: 2 })).toBe(fingerprint({ a: 2, b: 1 }));
  });

  it("differs when any content differs", () => {
    const a = [{ t: "p", c: [{ t: "text", v: "one" }] }];
    const b = [{ t: "p", c: [{ t: "text", v: "two" }] }];
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });

  it("differs when a block is added", () => {
    const a = [{ t: "p", c: [] }];
    const b = [{ t: "p", c: [] }, { t: "p", c: [] }];
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });
});
