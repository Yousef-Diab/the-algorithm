import { describe, it, expect } from "vitest";
import { exportLessonHtml } from "@/lib/content/export-html";
import { parseLessonHtml } from "@/lib/content/parse-html";
import type { Block, LessonMetaRow } from "@/lib/content/blocks";

const META: LessonMetaRow = {
  id: "m4-03",
  kind: "lesson",
  sectionId: "s1",
  monthId: "m4",
  title: "Orderblocks",
  heading: "Orderblocks",
  crumb: "Month 4 · Lesson 3",
  desc: [{ t: "text", v: "One-line summary." }],
  slug: "m4-03-orderblocks",
};

function out(blocks: Block[], meta = META) {
  return exportLessonHtml(meta, blocks);
}

describe("exportLessonHtml", () => {
  it("emits the section, hero and the two render-time slots", () => {
    const html = out([{ t: "p", c: [{ t: "text", v: "Body." }] }]);
    expect(html).toContain('<section class="lesson" id="m4-03" data-title="Orderblocks" data-month="m4">');
    expect(html).toContain('<div class="crumb">Month 4 · Lesson 3</div>');
    expect(html).toContain("<h2>Orderblocks</h2>");
    expect(html).toContain('<div class="desc">One-line summary.</div>');
    expect(html).toContain('<div class="quiz" data-quiz="m4-03"></div>');
    expect(html).toContain('<div class="lesson-footer"></div>');
  });

  it("emits a review section with data-kind and the review footer", () => {
    const html = out([{ t: "p", c: [{ t: "text", v: "x" }] }], {
      ...META,
      id: "s1-review",
      kind: "review",
      monthId: null,
      title: "Section Summary",
      heading: "ICT Core — Section Summary",
    });
    expect(html).toContain('<section class="lesson" id="s1-review" data-kind="review" data-section="s1" data-title="Section Summary">');
    expect(html).toContain('<div class="review-footer"></div>');
    expect(html).not.toContain('class="quiz"');
    expect(html).not.toContain("data-month");
  });

  it("escapes only &, < and >", () => {
    const html = out([{ t: "h3", c: [{ t: "text", v: "Definition & Validation <x>" }] }]);
    expect(html).toContain("<h3>Definition &amp; Validation &lt;x&gt;</h3>");
    // Typographic characters stay literal.
    expect(out([{ t: "p", c: [{ t: "text", v: "2–3× · “q”" }] }])).toContain("2–3× · “q”");
  });

  it("emits inline marks, including br and the src pointer", () => {
    expect(
      out([{ t: "p", c: [{ t: "strong", c: [{ t: "em", c: [{ t: "text", v: "a" }] }] }, { t: "br" }, { t: "src", c: [{ t: "text", v: "(L2)" }] }] }]),
    ).toContain('<p><strong><em>a</em></strong><br><span class="src">(L2)</span></p>');
  });

  it("emits a callout with its tag and an interleaved list", () => {
    expect(
      out([
        {
          t: "callout",
          variant: "rule",
          tag: [{ t: "text", v: "Rule" }],
          c: [
            { t: "run", c: [{ t: "text", v: "Lead-in:" }] },
            { t: "list", ordered: false, items: [[{ t: "text", v: "one" }]] },
          ],
        },
      ]),
    ).toContain('<div class="callout rule"><span class="tag">Rule</span>Lead-in:<ul><li>one</li></ul></div>');
  });

  it("emits a note callout with no variant class", () => {
    expect(out([{ t: "callout", variant: "note", tag: [{ t: "text", v: "T" }], c: [] }])).toContain(
      '<div class="callout"><span class="tag">T</span></div>',
    );
  });

  it("emits kv as flat cells", () => {
    expect(
      out([{ t: "kv", rows: [{ k: [{ t: "text", v: "Macro" }], v: [{ t: "text", v: "d" }] }] }]),
    ).toContain('<div class="kv"><div>Macro</div><div>d</div></div>');
  });

  it("emits flips in the flip-inner dialect", () => {
    expect(out([{ t: "flipRow", cards: [{ front: [{ t: "text", v: "F" }], back: [{ t: "text", v: "B" }] }] }])).toContain(
      '<div class="flip-row"><div class="flip"><div class="flip-inner"><div class="flip-front">F</div><div class="flip-back">B</div></div></div></div>',
    );
  });

  it("emits flipHint and figures", () => {
    const html = out([{ t: "flipHint", v: "Click a card to flip it" }, { t: "figures", slug: "m4-03-orderblocks" }]);
    expect(html).toContain('<div class="flip-hint">Click a card to flip it</div>');
    expect(html).toContain('<div class="fig-slot" data-slug="m4-03-orderblocks"></div>');
  });

  it("round-trips its own output through the parser", () => {
    const blocks: Block[] = [
      { t: "h3", c: [{ t: "text", v: "Definition & Validation" }] },
      { t: "p", c: [{ t: "text", v: "a " }, { t: "strong", c: [{ t: "text", v: "b" }] }] },
      { t: "list", ordered: true, items: [[{ t: "text", v: "one" }], [{ t: "text", v: "two" }]] },
      { t: "callout", variant: "warn", tag: [{ t: "text", v: "T" }], c: [{ t: "run", c: [{ t: "text", v: "x" }] }] },
      { t: "kv", rows: [{ k: [{ t: "text", v: "K" }], v: [{ t: "text", v: "V" }] }] },
      { t: "flipRow", cards: [{ front: [{ t: "text", v: "F" }], back: [{ t: "text", v: "B" }] }] },
      { t: "figures", slug: "m4-03-orderblocks" },
    ];
    const again = parseLessonHtml(out(blocks), { sectionId: "s1", monthId: "m4" });
    expect(again.blocks).toEqual(blocks);
    expect(again.meta).toEqual({ ...META, slug: "" });
  });
});
