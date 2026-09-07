/**
 * The closed block vocabulary of a lesson body. Derived from a full survey of
 * the 80 source HTML files; see the plan's "source vocabulary" table. Adding a
 * type here means adding a parser branch, an exporter branch and a renderer
 * branch — all three, or the round-trip gate fails.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "br" }
  /** span.src — the "(L4)" lesson pointer. */
  | { t: "src"; c: Inline[] };

/** A callout body is bare inline runs, optionally interleaved with lists. */
export type CalloutChild =
  | { t: "run"; c: Inline[] }
  | { t: "list"; ordered: boolean; items: Inline[][] };

export type Block =
  | { t: "h3"; c: Inline[] }
  | { t: "h4"; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "list"; ordered: boolean; items: Inline[][] }
  | { t: "callout"; variant: "note" | "rule" | "warn"; tag: Inline[]; c: CalloutChild[] }
  | { t: "kv"; rows: { k: Inline[]; v: Inline[] }[] }
  | { t: "flipRow"; cards: { front: Inline[]; back: Inline[] }[] }
  | { t: "flipHint"; v: string }
  | { t: "figures"; slug: string };

export type LessonKind = "lesson" | "review" | "exam";

/** Everything the hero and the nav need — the non-body half of a lesson row. */
export interface LessonMetaRow {
  id: string;
  kind: LessonKind;
  sectionId: string;
  monthId: string | null;
  /** Nav/card/SEO title — the source's data-title. */
  title: string;
  /** Hero <h2> text. Differs from `title` in 6 of 80 files. */
  heading: string;
  crumb: string;
  desc: Inline[];
  slug: string;
}

export function inlineText(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      switch (n.t) {
        case "text":
          return n.v;
        case "br":
          return " ";
        default:
          return inlineText(n.c);
      }
    })
    .join("");
}

function fail(msg: string): never {
  throw new Error(`invalid block JSON: ${msg}`);
}

function assertInline(v: unknown, where: string): Inline {
  if (typeof v !== "object" || v === null) fail(`${where}: expected an object`);
  const n = v as Record<string, unknown>;
  switch (n.t) {
    case "text":
      if (typeof n.v !== "string") fail(`${where}: text.v must be a string`);
      return { t: "text", v: n.v };
    case "br":
      return { t: "br" };
    case "strong":
    case "em":
    case "src":
      return { t: n.t, c: assertInlines(n.c, `${where}/${n.t}`) } as Inline;
    default:
      fail(`${where}: unknown inline type "${String(n.t)}"`);
  }
}

function assertInlines(v: unknown, where: string): Inline[] {
  if (!Array.isArray(v)) fail(`${where}: expected an array of inline nodes`);
  return v.map((n, i) => assertInline(n, `${where}[${i}]`));
}

function assertItems(v: unknown, where: string): Inline[][] {
  if (!Array.isArray(v)) fail(`${where}: expected an array of list items`);
  return v.map((it, i) => assertInlines(it, `${where}[${i}]`));
}

export function assertBlocks(v: unknown): Block[] {
  if (!Array.isArray(v)) fail("body must be an array of blocks");
  return v.map((raw, i) => {
    if (typeof raw !== "object" || raw === null) fail(`block[${i}]: expected an object`);
    const b = raw as Record<string, unknown>;
    const at = `block[${i}]`;
    switch (b.t) {
      case "h3":
      case "h4":
      case "p":
        return { t: b.t, c: assertInlines(b.c, at) } as Block;
      case "list":
        if (typeof b.ordered !== "boolean") fail(`${at}: list.ordered must be a boolean`);
        return { t: "list", ordered: b.ordered, items: assertItems(b.items, at) };
      case "callout": {
        if (b.variant !== "note" && b.variant !== "rule" && b.variant !== "warn")
          fail(`${at}: unknown callout variant "${String(b.variant)}"`);
        if (!Array.isArray(b.tag) || b.tag.length === 0)
          fail(`${at}: callout must carry a non-empty tag`);
        if (!Array.isArray(b.c)) fail(`${at}: callout.c must be an array`);
        const c = b.c.map((raw2, j) => {
          const ch = raw2 as Record<string, unknown>;
          if (ch?.t === "run") return { t: "run" as const, c: assertInlines(ch.c, `${at}/run[${j}]`) };
          if (ch?.t === "list") {
            if (typeof ch.ordered !== "boolean") fail(`${at}/list[${j}]: ordered must be a boolean`);
            return { t: "list" as const, ordered: ch.ordered, items: assertItems(ch.items, `${at}/list[${j}]`) };
          }
          return fail(`${at}: unknown callout child "${String(ch?.t)}"`);
        });
        return { t: "callout", variant: b.variant, tag: assertInlines(b.tag, `${at}/tag`), c };
      }
      case "kv": {
        if (!Array.isArray(b.rows)) fail(`${at}: kv.rows must be an array`);
        return {
          t: "kv",
          rows: b.rows.map((r, j) => {
            const row = r as Record<string, unknown>;
            return {
              k: assertInlines(row?.k, `${at}/rows[${j}].k`),
              v: assertInlines(row?.v, `${at}/rows[${j}].v`),
            };
          }),
        };
      }
      case "flipRow": {
        if (!Array.isArray(b.cards) || b.cards.length === 0) fail(`${at}: flipRow needs at least one card`);
        return {
          t: "flipRow",
          cards: b.cards.map((cd, j) => {
            const card = cd as Record<string, unknown>;
            return {
              front: assertInlines(card?.front, `${at}/cards[${j}].front`),
              back: assertInlines(card?.back, `${at}/cards[${j}].back`),
            };
          }),
        };
      }
      case "flipHint":
        if (typeof b.v !== "string") fail(`${at}: flipHint.v must be a string`);
        return { t: "flipHint", v: b.v };
      case "figures":
        if (typeof b.slug !== "string" || !b.slug) fail(`${at}: figures.slug must be a non-empty string`);
        return { t: "figures", slug: b.slug };
      default:
        return fail(`${at}: unknown block type "${String(b.t)}"`);
    }
  });
}
