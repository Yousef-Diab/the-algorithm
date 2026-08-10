import { parse, type HTMLElement, type Node } from "node-html-parser";

const ELEMENT = 1;
const TEXT = 3;
const COMMENT = 8;
const isElement = (n: Node): n is HTMLElement => n.nodeType === ELEMENT;
const isText = (n: Node): boolean => n.nodeType === TEXT;

export interface DialectCounts {
  bCell: number;
  spanCell: number;
  kvWrappedRow: number;
  flipIn: number;
  flipFace: number;
  /** HTML comments the parser drops. 17 across 7 files. */
  comment: number;
}

const VOID = new Set(["br"]);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function classes(el: HTMLElement): string[] {
  return (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/**
 * A stable serialisation that ignores everything the two sides are allowed to
 * disagree about: indentation, whitespace runs, attribute order, class order,
 * and entity spelling. node-html-parser decodes entities into `.text`, so
 * re-escaping here puts both sides in the same spelling.
 */
function serialize(node: Node): string {
  if (isText(node)) return esc(node.text.replace(/\s+/g, " "));
  if (!isElement(node)) return "";
  const el = node;
  const tag = el.rawTagName.toLowerCase();
  const attrs = Object.entries(el.attributes)
    .map(([k, v]) => [k, k === "class" ? v.split(/\s+/).filter(Boolean).sort().join(" ") : v] as const)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  if (VOID.has(tag)) return `<${tag}${attrs}>`;
  const inner = el.childNodes.map(serialize).join("");
  return `<${tag}${attrs}>${inner}</${tag}>`;
}

/** Drop whitespace-only text between elements, then trim the seams. */
function stripLayoutWhitespace(el: HTMLElement): void {
  for (const child of [...el.childNodes]) {
    if (isText(child) && !child.text.trim()) child.remove();
    else if (isElement(child)) stripLayoutWhitespace(child);
  }
}

export function canonicalHtml(html: string): string {
  const root = parse(html);
  const section = root.querySelector("section.lesson");
  if (!section) throw new Error("canonicalHtml: no section.lesson");
  stripLayoutWhitespace(section);
  return serialize(section);
}

/**
 * Rewrites the authoring dialects the corpus contains into the single dialect
 * the exporter emits, counting each rewrite. See the plan's dialect table for
 * the expected totals.
 */
export function canonicalizeSource(html: string, counts: DialectCounts): string {
  const root = parse(html, { comment: true });
  const section = root.querySelector("section.lesson");
  if (!section) throw new Error("canonicalizeSource: no section.lesson");

  // --- kv: unwrap cell-level <b>/<span>, flatten row-wrapped rows ----------
  for (const kv of section.querySelectorAll(".kv")) {
    for (const row of kv.childNodes.filter(isElement)) {
      const cells = row.childNodes.filter(isElement);
      const isCell = (c: HTMLElement) =>
        ["span", "b"].includes(c.rawTagName.toLowerCase()) && classes(c).length === 0;
      const wrapped =
        cells.length === 2 &&
        cells.every(isCell) &&
        !row.childNodes.some((n) => isText(n) && n.text.trim());
      if (!wrapped) continue;

      counts.kvWrappedRow += 1;
      for (const c of cells) {
        if (c.rawTagName.toLowerCase() === "b") counts.bCell += 1;
        else counts.spanCell += 1;
      }
      row.replaceWith(cells.map((c) => `<div>${c.innerHTML}</div>`).join(""));
    }
  }

  // --- flips: .flip-in → .flip-inner, drop the flip-face class -------------
  for (const inner of section.querySelectorAll(".flip-in")) {
    counts.flipIn += 1;
    inner.setAttribute("class", "flip-inner");
  }
  for (const face of section.querySelectorAll(".flip-face")) {
    counts.flipFace += 1;
    face.setAttribute("class", classes(face).filter((c) => c !== "flip-face").join(" "));
  }

  // --- comments: the parser drops them, so strip them here and COUNT them ---
  // parse() is called WITH { comment: true } so they are visible to be counted;
  // silently letting them stay invisible is what this rule exists to prevent.
  // Recurses into every depth, not just the section's direct children.
  const stripComments = (el: HTMLElement): void => {
    for (const node of [...el.childNodes]) {
      if (node.nodeType === COMMENT) {
        counts.comment += 1;
        node.remove();
      } else if (isElement(node)) {
        stripComments(node);
      }
    }
  };
  stripComments(section);

  stripLayoutWhitespace(section);
  return serialize(section);
}
