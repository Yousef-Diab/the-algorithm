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

  it("accepts a callout whose children interleave run and list — the real corpus shape (34 occurrences)", () => {
    const blocks: Block[] = [
      {
        t: "callout",
        variant: "warn",
        tag: [{ t: "text", v: "Bearish OBs" }],
        c: [
          { t: "run", c: [{ t: "text", v: "Look for these signs:" }] },
          {
            t: "list",
            ordered: false,
            items: [
              [{ t: "text", v: "Displacement through the OB" }],
              [{ t: "text", v: "A liquidity sweep beforehand" }],
            ],
          },
          { t: "run", c: [{ t: "text", v: "Then confirm on the LTF." }] },
        ],
      },
    ];
    expect(assertBlocks(JSON.parse(JSON.stringify(blocks)))).toEqual(blocks);
  });

  it("throws on a callout child with an unknown type", () => {
    expect(() =>
      assertBlocks([
        {
          t: "callout",
          variant: "note",
          tag: [{ t: "text", v: "Tag" }],
          c: [{ t: "quote", c: [{ t: "text", v: "x" }] }],
        },
      ]),
    ).toThrow(/unknown callout child "quote"/);
  });

  it("accepts a top-level list with ordered: true", () => {
    const blocks: Block[] = [
      { t: "list", ordered: true, items: [[{ t: "text", v: "one" }], [{ t: "text", v: "two" }]] },
    ];
    expect(assertBlocks(JSON.parse(JSON.stringify(blocks)))).toEqual(blocks);
  });
});

describe("assertBlocks throw branches", () => {
  it("throws on a kv row missing k", () => {
    expect(() =>
      assertBlocks([{ t: "kv", rows: [{ v: [{ t: "text", v: "y" }] }] }]),
    ).toThrow(/rows\[0\]\.k: expected an array of inline nodes/);
  });

  it("throws on a kv row missing v", () => {
    expect(() =>
      assertBlocks([{ t: "kv", rows: [{ k: [{ t: "text", v: "Macro" }] }] }]),
    ).toThrow(/rows\[0\]\.v: expected an array of inline nodes/);
  });

  it("throws on a top-level list with non-boolean ordered", () => {
    expect(() =>
      assertBlocks([{ t: "list", ordered: "false", items: [[{ t: "text", v: "one" }]] }]),
    ).toThrow(/list\.ordered must be a boolean/);
  });

  it("throws on a callout list child with non-boolean ordered", () => {
    expect(() =>
      assertBlocks([
        {
          t: "callout",
          variant: "note",
          tag: [{ t: "text", v: "Tag" }],
          c: [{ t: "list", ordered: "false", items: [[{ t: "text", v: "one" }]] }],
        },
      ]),
    ).toThrow(/list\[0\]: ordered must be a boolean/);
  });

  it("throws on a flipRow with zero cards", () => {
    expect(() => assertBlocks([{ t: "flipRow", cards: [] }])).toThrow(
      /flipRow needs at least one card/,
    );
  });

  it("throws on a flipHint with a non-string v", () => {
    expect(() => assertBlocks([{ t: "flipHint", v: 42 }])).toThrow(
      /flipHint\.v must be a string/,
    );
  });

  it("throws on figures with an empty slug", () => {
    expect(() => assertBlocks([{ t: "figures", slug: "" }])).toThrow(
      /figures\.slug must be a non-empty string/,
    );
  });

  it("throws on an unknown callout variant", () => {
    expect(() =>
      assertBlocks([{ t: "callout", variant: "bogus", tag: [{ t: "text", v: "Tag" }], c: [] }]),
    ).toThrow(/unknown callout variant "bogus"/);
  });

  it("throws when callout.c is not an array", () => {
    expect(() =>
      assertBlocks([{ t: "callout", variant: "note", tag: [{ t: "text", v: "Tag" }], c: "nope" }]),
    ).toThrow(/callout\.c must be an array/);
  });

  it("throws on a null entry nested inside a p's c array", () => {
    expect(() => assertBlocks([{ t: "p", c: [null] }])).toThrow(/block\[0\]\[0\]: expected an object/);
  });
});
