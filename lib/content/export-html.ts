import type { Block, CalloutChild, Inline, LessonMetaRow } from "./blocks";

/** Only the three characters that change meaning in HTML text. */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

function inlines(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      switch (n.t) {
        case "text":
          return esc(n.v);
        case "br":
          return "<br>";
        case "strong":
          return `<strong>${inlines(n.c)}</strong>`;
        case "em":
          return `<em>${inlines(n.c)}</em>`;
        case "src":
          return `<span class="src">${inlines(n.c)}</span>`;
      }
    })
    .join("");
}

function list(ordered: boolean, items: Inline[][]): string {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((it) => `<li>${inlines(it)}</li>`).join("")}</${tag}>`;
}

function calloutChild(c: CalloutChild): string {
  return c.t === "run" ? inlines(c.c) : list(c.ordered, c.items);
}

function block(b: Block): string {
  switch (b.t) {
    case "h3":
      return `<h3>${inlines(b.c)}</h3>`;
    case "h4":
      return `<h4>${inlines(b.c)}</h4>`;
    case "p":
      return `<p>${inlines(b.c)}</p>`;
    case "list":
      return list(b.ordered, b.items);
    case "callout": {
      const cls = b.variant === "note" ? "callout" : `callout ${b.variant}`;
      return `<div class="${cls}"><span class="tag">${inlines(b.tag)}</span>${b.c.map(calloutChild).join("")}</div>`;
    }
    case "kv":
      return `<div class="kv">${b.rows
        .map((r) => `<div>${inlines(r.k)}</div><div>${inlines(r.v)}</div>`)
        .join("")}</div>`;
    case "flipRow":
      return `<div class="flip-row">${b.cards
        .map(
          (c) =>
            `<div class="flip"><div class="flip-inner"><div class="flip-front">${inlines(
              c.front,
            )}</div><div class="flip-back">${inlines(c.back)}</div></div></div>`,
        )
        .join("")}</div>`;
    case "flipHint":
      return `<div class="flip-hint">${esc(b.v)}</div>`;
    case "figures":
      return `<div class="fig-slot" data-slug="${escAttr(b.slug)}"></div>`;
  }
}

/**
 * Canonical HTML for a lesson body. Used by the round-trip fidelity gate and by
 * scripts/export-content.mjs; it is NOT what the site renders (that is
 * BlockRenderer). Indentation is cosmetic — the gate compares canonicalised
 * HTML, so whitespace between tags never matters.
 */
export function exportLessonHtml(meta: LessonMetaRow, blocks: Block[]): string {
  const attrs = [`class="lesson"`, `id="${escAttr(meta.id)}"`];
  if (meta.kind !== "lesson") {
    attrs.push(`data-kind="${meta.kind}"`, `data-section="${escAttr(meta.sectionId)}"`);
  }
  attrs.push(`data-title="${escAttr(meta.title)}"`);
  if (meta.kind === "lesson" && meta.monthId) attrs.push(`data-month="${escAttr(meta.monthId)}"`);

  const slots =
    meta.kind === "lesson"
      ? [`<div class="quiz" data-quiz="${escAttr(meta.id)}"></div>`, `<div class="lesson-footer"></div>`]
      : [`<div class="review-footer"></div>`];

  return [
    `<section ${attrs.join(" ")}>`,
    `  <div class="lesson-hero">`,
    `    <div class="crumb">${esc(meta.crumb)}</div>`,
    `    <h2>${esc(meta.heading)}</h2>`,
    `    <div class="desc">${inlines(meta.desc)}</div>`,
    `  </div>`,
    ...blocks.map((b) => `  ${block(b)}`),
    ...slots.map((s) => `  ${s}`),
    `</section>`,
    "",
  ].join("\n");
}
