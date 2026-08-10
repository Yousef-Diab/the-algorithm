import { describe, it, expect } from "vitest";
import { assertBlocks, inlineText, type Block } from "@/lib/content/blocks";

describe("inlineText", () => {
  it("flattens nested marks to plain text", () => {
    expect(
      inlineText([
        { t: "text", v: "A live long taken " },
        { t: "em", c: [{ t: "text", v: "against" }] },
        { t: "text", v: " the daily bias" },
      ]),
    ).toBe("A live long taken against the daily bias");
  });

  it("renders a br as a single space", () => {
    expect(inlineText([{ t: "text", v: "1. Trade Inside" }, { t: "br" }, { t: "text", v: "the Range" }]))
      .toBe("1. Trade Inside the Range");
  });
});

describe("assertBlocks", () => {
  it("accepts every block type", () => {
    const blocks: Block[] = [
      { t: "h3", c: [{ t: "text", v: "Definition" }] },
      { t: "h4", c: [{ t: "text", v: "Pattern one " }, { t: "src", c: [{ t: "text", v: "(bearish)" }] }] },
      { t: "p", c: [{ t: "text", v: "Body." }] },
      { t: "list", ordered: false, items: [[{ t: "text", v: "one" }]] },
      { t: "callout", variant: "warn", tag: [{ t: "text", v: "Bearish OBs" }], c: [{ t: "run", c: [{ t: "text", v: "x" }] }] },
      { t: "kv", rows: [{ k: [{ t: "text", v: "Macro" }], v: [{ t: "text", v: "y" }] }] },
      { t: "flipRow", cards: [{ front: [{ t: "text", v: "Q" }], back: [{ t: "text", v: "A" }] }] },
      { t: "flipHint", v: "Click a card to flip it" },
      { t: "figures", slug: "m4-03-orderblocks" },
    ];
    expect(assertBlocks(JSON.parse(JSON.stringify(blocks)))).toEqual(blocks);
  });

  it("throws on an unknown block type", () => {
    expect(() => assertBlocks([{ t: "table", rows: [] }])).toThrow(/unknown block type "table"/);
  });

  it("throws on an unknown inline type", () => {
    expect(() => assertBlocks([{ t: "p", c: [{ t: "a", href: "x" }] }])).toThrow(/unknown inline type "a"/);
  });

  it("throws on a callout with no tag", () => {
    expect(() => assertBlocks([{ t: "callout", variant: "note", c: [] }])).toThrow(/callout .* tag/);
  });
});
