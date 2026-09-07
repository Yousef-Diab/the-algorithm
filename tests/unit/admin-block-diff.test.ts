import { describe, it, expect } from "vitest";
import { diffBlocks } from "@/lib/admin/block-diff";
import type { Block } from "@/lib/content/blocks";

const p = (v: string): Block => ({ t: "p", c: [{ t: "text", v }] }) as unknown as Block;
const tags = (rows: { tag: string }[]) => rows.map((r) => r.tag);

describe("diffBlocks", () => {
  it("marks identical bodies as all same", () => {
    const b = [p("a"), p("b"), p("c")];
    expect(tags(diffBlocks(b, b))).toEqual(["same", "same", "same"]);
  });

  it("marks a pure insertion as added and keeps the rest same", () => {
    const rows = diffBlocks([p("a"), p("c")], [p("a"), p("b"), p("c")]);
    expect(tags(rows)).toEqual(["same", "added", "same"]);
    expect(rows[1].live).toBeNull();
    expect(rows[1].draft).toEqual(p("b"));
  });

  it("marks a pure deletion as removed", () => {
    const rows = diffBlocks([p("a"), p("b"), p("c")], [p("a"), p("c")]);
    expect(tags(rows)).toEqual(["same", "removed", "same"]);
    expect(rows[1].draft).toBeNull();
    expect(rows[1].live).toEqual(p("b"));
  });

  it("pairs a removal followed by an insertion into a single changed row", () => {
    const rows = diffBlocks([p("a"), p("b"), p("c")], [p("a"), p("B"), p("c")]);
    expect(tags(rows)).toEqual(["same", "changed", "same"]);
    expect(rows[1].live).toEqual(p("b"));
    expect(rows[1].draft).toEqual(p("B"));
  });

  it("leaves the unpaired remainder as removed when more was deleted than added", () => {
    const rows = diffBlocks([p("a"), p("b"), p("c"), p("d")], [p("a"), p("B"), p("d")]);
    expect(tags(rows)).toEqual(["same", "changed", "removed", "same"]);
  });

  it("reports a swap truthfully rather than inventing a move", () => {
    const rows = diffBlocks([p("a"), p("b")], [p("b"), p("a")]);
    expect(rows).toHaveLength(3);
    expect(tags(rows)).toContain("same");
    expect(rows.filter((r) => r.tag === "same")).toHaveLength(1);
  });

  it("marks everything added when the live body is empty", () => {
    expect(tags(diffBlocks([], [p("a"), p("b")]))).toEqual(["added", "added"]);
  });

  it("marks everything removed when the draft body is empty", () => {
    expect(tags(diffBlocks([p("a"), p("b")], []))).toEqual(["removed", "removed"]);
  });

  it("returns nothing for two empty bodies", () => {
    expect(diffBlocks([], [])).toEqual([]);
  });
});
