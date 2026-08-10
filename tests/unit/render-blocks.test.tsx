import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { LightboxProvider } from "@/components/lightbox/LightboxProvider";
import type { Block } from "@/lib/content/blocks";

const html = (blocks: Block[]) => renderToStaticMarkup(<BlockRenderer blocks={blocks} lessonId="m4-03" />);

describe("BlockRenderer", () => {
  it("renders headings, paragraphs and lists", () => {
    const out = html([
      { t: "h3", c: [{ t: "text", v: "Definition & Validation" }] },
      { t: "p", c: [{ t: "text", v: "a " }, { t: "strong", c: [{ t: "text", v: "b" }] }] },
      { t: "list", ordered: true, items: [[{ t: "text", v: "one" }]] },
    ]);
    expect(out).toContain("<h3>Definition &amp; Validation</h3>");
    expect(out).toContain("a <strong>b</strong>");
    expect(out).toContain("<ol><li>one</li></ol>");
  });

  it("renders the h4 src pointer and a br", () => {
    const out = html([{ t: "h4", c: [{ t: "text", v: "T " }, { t: "src", c: [{ t: "text", v: "(L2)" }] }] }, { t: "p", c: [{ t: "br" }] }]);
    expect(out).toMatch(/<h4>T <span class="[^"]*">\(L2\)<\/span><\/h4>/);
    expect(out).toContain("<br/>");
  });

  it("renders a callout with its tag and an interleaved list", () => {
    const out = html([
      {
        t: "callout",
        variant: "warn",
        tag: [{ t: "text", v: "Bearish OBs" }],
        c: [{ t: "run", c: [{ t: "text", v: "x" }] }, { t: "list", ordered: false, items: [[{ t: "text", v: "y" }]] }],
      },
    ]);
    expect(out).toContain("Bearish OBs");
    expect(out).toContain("<ul><li>y</li></ul>");
  });

  it("renders kv rows as two cells each", () => {
    const out = html([{ t: "kv", rows: [{ k: [{ t: "text", v: "K" }], v: [{ t: "text", v: "V" }] }] }]);
    expect(out).toContain(">K<");
    expect(out).toContain(">V<");
  });

  it("renders a flip hint verbatim rather than a hardcoded string", () => {
    expect(html([{ t: "flipHint", v: "Click a card to flip it" }])).toContain("Click a card to flip it");
  });

  it("renders nothing for a figures block with no media", () => {
    expect(html([{ t: "figures", slug: "m4-03-orderblocks" }])).toBe("");
  });

  it("passes the lesson's figures to the single figures block", () => {
    // A lesson has at most one fig-slot (67 slots across 78 lessons), so one
    // `figures` array on BlockRenderer is enough for every figures block.
    const figures = [{ src: "/api/media/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", width: 10, height: 10, alt: "a" }];
    const out = renderToStaticMarkup(
      <LightboxProvider>
        <BlockRenderer blocks={[{ t: "figures", slug: "m4-03-orderblocks" }]} lessonId="m4-03" figures={figures} />
      </LightboxProvider>,
    );
    expect(out).toContain("/api/media/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
  });
});
