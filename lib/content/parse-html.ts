import { parse, type HTMLElement, type Node } from "node-html-parser";
import { inlineText } from "./blocks";
import type { Block, CalloutChild, Inline, LessonKind, LessonMetaRow } from "./blocks";

/** node-html-parser node type ids. */
const ELEMENT = 1;
const TEXT = 3;

const isElement = (n: Node): n is HTMLElement => n.nodeType === ELEMENT;
const isText = (n: Node): boolean => n.nodeType === TEXT;

function classesOf(el: HTMLElement): string[] {
  return (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** `div.callout.warn` — the shape used in every error message. */
function describe(el: HTMLElement): string {
  const cls = el.getAttribute("class");
  return cls ? `<${el.rawTagName} class="${cls}">` : `<${el.rawTagName}>`;
}

function bail(msg: string): never {
  throw new Error(`content parse error: ${msg}`);
}

/**
 * `.flip-hint`, the hero `<h2>` and `.crumb` are plain-text-only by design —
 * any element child (markup) is rejected rather than silently flattened away.
 */
function assertPlainText(el: HTMLElement, where: string): string {
  if (el.childNodes.some(isElement)) bail(`${where}: ${describe(el)} must be plain text, not markup`);
  return el.text.trim();
}

// ---------------------------------------------------------------- inline

const INLINE_TAGS = new Set(["strong", "em", "b", "br", "span"]);

/**
 * Inline children → Inline[]. `b` normalises to `strong` (the corpus uses them
 * interchangeably); a bare `span` is transparent (it only ever wraps a kv cell);
 * `span.src` is a real node.
 */
function parseInlines(nodes: Node[], where: string): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    if (isText(n)) {
      const v = n.text;
      if (v) out.push({ t: "text", v });
      continue;
    }
    if (!isElement(n)) continue;
    const tag = n.rawTagName?.toLowerCase();
    if (!tag || !INLINE_TAGS.has(tag)) bail(`${where}: unmapped inline <${tag ?? "?"}>`);
    switch (tag) {
      case "br":
        out.push({ t: "br" });
        break;
      case "strong":
      case "b":
        out.push({ t: "strong", c: parseInlines(n.childNodes, where) });
        break;
      case "em":
        out.push({ t: "em", c: parseInlines(n.childNodes, where) });
        break;
      case "span": {
        const cls = classesOf(n);
        if (cls.length === 0) out.push(...parseInlines(n.childNodes, where));
        else if (cls.length === 1 && cls[0] === "src")
          out.push({ t: "src", c: parseInlines(n.childNodes, where) });
        else bail(`${where}: unmapped inline ${describe(n)}`);
        break;
      }
    }
  }
  return mergeText(out);
}

/** Adjacent text nodes (produced by unwrapping a bare span) collapse into one. */
function mergeText(nodes: Inline[]): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    const prev = out[out.length - 1];
    if (n.t === "text" && prev?.t === "text") prev.v += n.v;
    else out.push(n);
  }
  return out;
}

function parseList(el: HTMLElement, where: string): Extract<Block, { t: "list" }> {
  const items: Inline[][] = [];
  for (const child of el.childNodes) {
    if (isText(child)) {
      if (child.text.trim()) bail(`${where}: stray text inside <${el.rawTagName}>`);
      continue;
    }
    if (!isElement(child)) continue;
    if (child.rawTagName?.toLowerCase() !== "li") bail(`${where}: unmapped element ${describe(child)} in a list`);
    items.push(parseInlines(child.childNodes, `${where}/li`));
  }
  return { t: "list", ordered: el.rawTagName.toLowerCase() === "ol", items };
}

// ---------------------------------------------------------------- blocks

function parseCallout(el: HTMLElement, where: string): Block {
  const cls = classesOf(el).filter((c) => c !== "callout");
  const variant = cls.length === 0 ? "note" : cls[0];
  if (cls.length > 1 || (variant !== "note" && variant !== "rule" && variant !== "warn"))
    bail(`${where}: unmapped element ${describe(el)}`);

  const kids = [...el.childNodes];
  const first = kids.find((n) => isElement(n) || (isText(n) && n.text.trim()));
  if (!first || !isElement(first) || !classesOf(first).includes("tag"))
    bail(`${where}: callout has no <span class="tag"> label`);
  const tag = parseInlines(first.childNodes, `${where}/tag`);

  const rest = kids.slice(kids.indexOf(first) + 1);
  const c: CalloutChild[] = [];
  let run: Node[] = [];
  const flush = () => {
    if (!run.length) return;
    const inlines = parseInlines(run, `${where}/run`);
    // A run that is entirely whitespace (e.g. the indentation before/after an
    // interleaved <ul>) carries no content and must not become a phantom run.
    // Whitespace-only *text nodes* still matter elsewhere (parseInlines keeps
    // them, since dropping them globally would fuse words like "b</strong>
    // <em>c" together) — this check only prunes empty runs at the callout
    // level, never the inline text itself.
    if (inlines.length && inlineText(inlines).trim()) c.push({ t: "run", c: inlines });
    run = [];
  };
  for (const n of rest) {
    const tagName = isElement(n) ? n.rawTagName?.toLowerCase() : null;
    if (tagName === "ul" || tagName === "ol") {
      flush();
      c.push(parseList(n as HTMLElement, where));
    } else {
      run.push(n);
    }
  }
  flush();
  return { t: "callout", variant, tag, c };
}

/**
 * `.kv` in either dialect. A row-wrapped cell pair is a div whose element
 * children are exactly two of {span, b} with no direct text; anything else is a
 * flat cell consumed in pairs.
 */
function parseKv(el: HTMLElement, where: string): Block {
  const cells: HTMLElement[] = [];
  const rows: { k: Inline[]; v: Inline[] }[] = [];

  for (const child of el.childNodes) {
    if (isText(child)) {
      if (child.text.trim()) bail(`${where}: stray text inside .kv`);
      continue;
    }
    if (!isElement(child)) continue;
    if (child.rawTagName?.toLowerCase() !== "div") bail(`${where}: unmapped element ${describe(child)} in .kv`);

    const elemKids = child.childNodes.filter(isElement);
    const wrapped =
      elemKids.length === 2 &&
      elemKids.every((k) => ["span", "b"].includes(k.rawTagName?.toLowerCase() ?? "") && classesOf(k).length === 0) &&
      !child.childNodes.some((k) => isText(k) && k.text.trim());

    if (wrapped) {
      if (cells.length) bail(`${where}: .kv mixes wrapped and flat rows`);
      rows.push({
        k: parseInlines(elemKids[0].childNodes, `${where}/k`),
        v: parseInlines(elemKids[1].childNodes, `${where}/v`),
      });
    } else {
      cells.push(child);
    }
  }

  if (cells.length) {
    if (rows.length) bail(`${where}: .kv mixes wrapped and flat rows`);
    if (cells.length % 2 !== 0) bail(`${where}: .kv has an odd number of cells (${cells.length})`);
    for (let i = 0; i < cells.length; i += 2)
      rows.push({
        k: parseInlines(cells[i].childNodes, `${where}/k`),
        v: parseInlines(cells[i + 1].childNodes, `${where}/v`),
      });
  }
  return { t: "kv", rows };
}

function parseFlipRow(el: HTMLElement, where: string): Block {
  const cards: { front: Inline[]; back: Inline[] }[] = [];
  for (const child of el.childNodes) {
    if (isText(child)) {
      if (child.text.trim()) bail(`${where}: stray text inside .flip-row`);
      continue;
    }
    if (!isElement(child)) continue;
    const flip = child;
    if (!classesOf(flip).includes("flip")) bail(`${where}: unmapped element ${describe(flip)} in .flip-row`);

    const flipElemKids = flip.childNodes.filter(isElement);
    if (flipElemKids.length !== 1)
      bail(`${where}: .flip must have exactly one child element (found ${flipElemKids.length})`);
    const inner = flipElemKids[0];
    const innerCls = classesOf(inner);
    if (!(innerCls.includes("flip-in") || innerCls.includes("flip-inner")))
      bail(`${where}: .flip has no .flip-in/.flip-inner wrapper`);

    const faces = inner.childNodes.filter(isElement);
    const front = faces.find((f) => classesOf(f).includes("flip-front"));
    const back = faces.find((f) => classesOf(f).includes("flip-back"));
    if (faces.length !== 2 || !front || !back) bail(`${where}: .flip needs exactly a front and a back face`);
    cards.push({
      front: parseInlines(front.childNodes, `${where}/front`),
      back: parseInlines(back.childNodes, `${where}/back`),
    });
  }
  if (!cards.length) bail(`${where}: .flip-row has no cards`);
  return { t: "flipRow", cards };
}

/** Slots the renderer supplies; they carry no content and are dropped. */
const DROPPED_CLASSES = new Set(["quiz", "lesson-footer", "review-footer"]);

function parseBlock(el: HTMLElement, where: string): Block | null {
  const tag = el.rawTagName?.toLowerCase();
  switch (tag) {
    case "h3":
    case "h4":
    case "p":
      return { t: tag, c: parseInlines(el.childNodes, `${where}/${tag}`) } as Block;
    case "ul":
    case "ol":
      return parseList(el, where);
    case "div": {
      const cls = classesOf(el);
      const hasContent = () => el.childNodes.some((n) => isElement(n) || (isText(n) && n.text.trim()));
      if (cls.length === 1 && DROPPED_CLASSES.has(cls[0])) {
        if (hasContent()) bail(`${where}: ${describe(el)} must be empty`);
        return null;
      }
      if (cls.includes("callout")) return parseCallout(el, where);
      if (cls.length === 1 && cls[0] === "kv") return parseKv(el, where);
      if (cls.length === 1 && cls[0] === "flip-row") return parseFlipRow(el, where);
      if (cls.length === 1 && cls[0] === "flip-hint") return { t: "flipHint", v: assertPlainText(el, where) };
      if (cls.length === 1 && cls[0] === "fig-slot") {
        const slug = el.getAttribute("data-slug");
        if (!slug) bail(`${where}: .fig-slot has no data-slug`);
        if (hasContent()) bail(`${where}: .fig-slot must be empty`);
        return { t: "figures", slug };
      }
      return bail(`${where}: unmapped element ${describe(el)}`);
    }
    default:
      return bail(`${where}: unmapped element ${describe(el)}`);
  }
}

// ---------------------------------------------------------------- entry

export function parseLessonHtml(
  html: string,
  ctx: { sectionId: string; monthId: string | null },
): { meta: LessonMetaRow; blocks: Block[] } {
  const root = parse(html);
  const section = root.querySelector("section.lesson");
  if (!section) bail("no <section class=\"lesson\"> found");

  const id = section.getAttribute("id");
  const title = section.getAttribute("data-title");
  if (!id) bail("<section> has no id");
  if (!title) bail(`${id}: <section> has no data-title`);

  const kindAttr = section.getAttribute("data-kind") ?? "lesson";
  if (kindAttr !== "lesson" && kindAttr !== "review" && kindAttr !== "exam")
    bail(`${id}: unknown data-kind "${kindAttr}"`);
  const kind = kindAttr as LessonKind;

  const hero = section.querySelector(".lesson-hero");
  if (!hero) bail(`${id}: no .lesson-hero`);
  const crumbEl = hero.querySelector(".crumb");
  const h2 = hero.querySelector("h2");
  const descEl = hero.querySelector(".desc");
  if (!crumbEl || !h2 || !descEl) bail(`${id}: .lesson-hero needs .crumb, <h2> and .desc`);

  const blocks: Block[] = [];
  for (const child of section.childNodes) {
    if (isText(child)) {
      if (child.text.trim()) bail(`${id}: stray text at the top level of the section`);
      continue;
    }
    if (!isElement(child)) continue;
    const childCls = classesOf(child);
    if (childCls.length === 1 && childCls[0] === "lesson-hero") continue;
    const b = parseBlock(child, id);
    if (b) blocks.push(b);
  }

  return {
    meta: {
      id,
      kind,
      sectionId: section.getAttribute("data-section") ?? ctx.sectionId,
      monthId: kind === "lesson" ? (section.getAttribute("data-month") ?? ctx.monthId) : null,
      title,
      heading: assertPlainText(h2, `${id}/h2`),
      crumb: assertPlainText(crumbEl, `${id}/crumb`),
      desc: parseInlines(descEl.childNodes, `${id}/desc`),
      slug: "",
    },
    blocks,
  };
}
