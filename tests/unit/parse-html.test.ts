import { describe, it, expect } from "vitest";
import { parseLessonHtml } from "@/lib/content/parse-html";

const CTX = { sectionId: "s1", monthId: "m4" };

function wrap(body: string, attrs = 'id="m4-03" data-title="Orderblocks" data-month="m4"') {
  return `<section class="lesson" ${attrs}>
  <div class="lesson-hero">
    <div class="crumb">Month 4 · Lesson 3</div>
    <h2>Orderblocks</h2>
    <div class="desc">One-line summary.</div>
  </div>
${body}
  <div class="quiz" data-quiz="m4-03"></div>
  <div class="lesson-footer"></div>
</section>`;
}

describe("meta", () => {
  it("reads the hero and the section attributes", () => {
    const { meta } = parseLessonHtml(wrap("  <p>Body.</p>"), CTX);
    expect(meta).toMatchObject({
      id: "m4-03",
      kind: "lesson",
      sectionId: "s1",
      monthId: "m4",
      title: "Orderblocks",
      heading: "Orderblocks",
      crumb: "Month 4 · Lesson 3",
    });
    expect(meta.desc).toEqual([{ t: "text", v: "One-line summary." }]);
  });

  it("keeps title and heading apart when they differ", () => {
    const html = wrap("  <p>x</p>", 'id="m2-07" data-title="Market Maker Trap: False Flag" data-month="m2"')
      .replace("<h2>Orderblocks</h2>", "<h2>Market Maker Trap — False Flag</h2>");
    const { meta } = parseLessonHtml(html, { sectionId: "s1", monthId: "m2" });
    expect(meta.title).toBe("Market Maker Trap: False Flag");
    expect(meta.heading).toBe("Market Maker Trap — False Flag");
  });

  it("keeps markup in a rich desc", () => {
    const html = wrap("  <p>x</p>").replace(
      '<div class="desc">One-line summary.</div>',
      '<div class="desc">A long taken <em>against</em> the bias.</div>',
    );
    expect(parseLessonHtml(html, CTX).meta.desc).toEqual([
      { t: "text", v: "A long taken " },
      { t: "em", c: [{ t: "text", v: "against" }] },
      { t: "text", v: " the bias." },
    ]);
  });

  it("reads data-kind and data-section on a review page", () => {
    const html = `<section class="lesson" id="s1-review" data-kind="review" data-section="s1" data-title="Section Summary">
  <div class="lesson-hero"><div class="crumb">ICT Core · Section Review</div><h2>ICT Core — Section Summary</h2><div class="desc">d</div></div>
  <p>x</p>
  <div class="review-footer"></div>
</section>`;
    const { meta } = parseLessonHtml(html, { sectionId: "s1", monthId: null });
    expect(meta).toMatchObject({ id: "s1-review", kind: "review", monthId: null });
  });
});

describe("blocks", () => {
  it("parses inline marks, including nesting and br", () => {
    const { blocks } = parseLessonHtml(
      wrap("  <p>a <strong>b <em>c</em></strong><br>d</p>"),
      CTX,
    );
    expect(blocks).toEqual([
      {
        t: "p",
        c: [
          { t: "text", v: "a " },
          { t: "strong", c: [{ t: "text", v: "b " }, { t: "em", c: [{ t: "text", v: "c" }] }] },
          { t: "br" },
          { t: "text", v: "d" },
        ],
      },
    ]);
  });

  it("decodes entities into text", () => {
    const { blocks } = parseLessonHtml(wrap("  <h3>Definition &amp; Validation</h3>"), CTX);
    expect(blocks).toEqual([{ t: "h3", c: [{ t: "text", v: "Definition & Validation" }] }]);
  });

  it("parses h4 with its src pointer", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <h4>The daily template <span class="src">(L2)</span></h4>'),
      CTX,
    );
    expect(blocks).toEqual([
      {
        t: "h4",
        c: [{ t: "text", v: "The daily template " }, { t: "src", c: [{ t: "text", v: "(L2)" }] }],
      },
    ]);
  });

  it("parses all three callout variants and requires a tag", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="callout warn"><span class="tag">Bearish OBs</span>Body <strong>x</strong>.</div>'),
      CTX,
    );
    expect(blocks).toEqual([
      {
        t: "callout",
        variant: "warn",
        tag: [{ t: "text", v: "Bearish OBs" }],
        c: [{ t: "run", c: [{ t: "text", v: "Body " }, { t: "strong", c: [{ t: "text", v: "x" }] }, { t: "text", v: "." }] }],
      },
    ]);
    expect(() => parseLessonHtml(wrap('  <div class="callout">No tag.</div>'), CTX)).toThrow(/no <span class="tag">/);
  });

  it("parses a callout that interleaves a list", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="callout rule"><span class="tag">Rule</span>Lead-in:<ul><li>one</li></ul>tail</div>'),
      CTX,
    );
    expect(blocks[0]).toMatchObject({
      t: "callout",
      variant: "rule",
      c: [
        { t: "run", c: [{ t: "text", v: "Lead-in:" }] },
        { t: "list", ordered: false, items: [[{ t: "text", v: "one" }]] },
        { t: "run", c: [{ t: "text", v: "tail" }] },
      ],
    });
  });

  it("parses both kv dialects into the same rows", () => {
    const flat = parseLessonHtml(
      wrap('  <div class="kv"><div>Term</div><div>Def</div><div>T2</div><div>D2</div></div>'),
      CTX,
    ).blocks[0];
    const wrapped = parseLessonHtml(
      wrap('  <div class="kv"><div><b>Term</b><span>Def</span></div><div><span>T2</span><span>D2</span></div></div>'),
      CTX,
    ).blocks[0];
    const expected = {
      t: "kv",
      rows: [
        { k: [{ t: "text", v: "Term" }], v: [{ t: "text", v: "Def" }] },
        { k: [{ t: "text", v: "T2" }], v: [{ t: "text", v: "D2" }] },
      ],
    };
    expect(flat).toEqual(expected);
    expect(wrapped).toEqual(expected);
  });

  it("throws on an odd number of flat kv cells", () => {
    expect(() =>
      parseLessonHtml(wrap('  <div class="kv"><div>a</div><div>b</div><div>c</div></div>'), CTX),
    ).toThrow(/odd number of cells/);
  });

  it("parses both flip dialects into the same cards", () => {
    const a = parseLessonHtml(
      wrap('  <div class="flip-row"><div class="flip"><div class="flip-in"><div class="flip-face flip-front">F</div><div class="flip-face flip-back">B</div></div></div></div>'),
      CTX,
    ).blocks[0];
    const b = parseLessonHtml(
      wrap('  <div class="flip-row"><div class="flip"><div class="flip-inner"><div class="flip-front">F</div><div class="flip-back">B</div></div></div></div>'),
      CTX,
    ).blocks[0];
    const expected = { t: "flipRow", cards: [{ front: [{ t: "text", v: "F" }], back: [{ t: "text", v: "B" }] }] };
    expect(a).toEqual(expected);
    expect(b).toEqual(expected);
  });

  it("keeps a detached flip-hint as its own block", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="flip-row"><div class="flip"><div class="flip-inner"><div class="flip-front">F</div><div class="flip-back">B</div></div></div></div>\n  <p>between</p>\n  <div class="flip-hint">Click a card to flip it</div>'),
      CTX,
    );
    expect(blocks.map((b) => b.t)).toEqual(["flipRow", "p", "flipHint"]);
  });

  it("parses a fig-slot into a figures block", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="fig-slot" data-slug="m4-03-orderblocks"></div>'),
      CTX,
    );
    expect(blocks).toEqual([{ t: "figures", slug: "m4-03-orderblocks" }]);
  });

  it("drops the three render-time slots", () => {
    const { blocks } = parseLessonHtml(wrap("  <p>only</p>"), CTX);
    expect(blocks).toHaveLength(1);
  });

  it("throws on an unmapped element", () => {
    expect(() => parseLessonHtml(wrap("  <table><tr><td>x</td></tr></table>"), CTX)).toThrow(
      /unmapped element <table>/,
    );
  });

  it("throws on an unmapped div class", () => {
    expect(() => parseLessonHtml(wrap('  <div class="tip">x</div>'), CTX)).toThrow(
      /unmapped element <div class="tip">/,
    );
  });

  it("throws on an unmapped inline element", () => {
    expect(() => parseLessonHtml(wrap('  <p>see <a href="x">this</a></p>'), CTX)).toThrow(
      /unmapped inline <a>/,
    );
  });
});
