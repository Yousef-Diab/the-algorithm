import { describe, it, expect } from "vitest";
import { importDecision } from "@/lib/content/import-guard";

describe("importDecision", () => {
  it("writes a plain imported row", () => {
    expect(importDecision({ writeOrigin: "import", bodyDraft: null }, false)).toEqual({ write: true });
  });

  it("refuses a cms-authored row without --force", () => {
    const d = importDecision({ writeOrigin: "cms", bodyDraft: null }, false);
    expect(d.write).toBe(false);
    expect(d.reason).toMatch(/edited in the CMS/);
  });

  it("writes a cms row when --force is given", () => {
    expect(importDecision({ writeOrigin: "cms", bodyDraft: null }, true).write).toBe(true);
  });

  it("refuses a row with a pending draft EVEN WITH --force", () => {
    // Otherwise the import replaces the live body underneath a draft, leaving
    // source_ref_draft describing prose that no longer relates to what is live.
    const d = importDecision({ writeOrigin: "import", bodyDraft: [{ t: "p", c: [] }] }, true);
    expect(d.write).toBe(false);
    expect(d.reason).toMatch(/pending draft/);
  });

  it("treats a brand-new row (no existing record) as writable", () => {
    expect(importDecision(null, false)).toEqual({ write: true });
  });

  it("refuses a cms-authored row with a pending draft even with --force (draft is checked first)", () => {
    // The case that distinguishes "draft checked first" from "cms checked
    // first": if writeOrigin were checked first, --force alone would pass
    // this through and the reason would talk about the CMS, not the draft.
    const d = importDecision({ writeOrigin: "cms", bodyDraft: [{ t: "p", c: [] }] }, true);
    expect(d.write).toBe(false);
    expect(d.reason).toMatch(/pending draft/);
  });
});
