"use client";

import { useLightbox } from "@/components/lightbox/LightboxProvider";

/* A real image with a real intrinsic size (1200x700), so zoom/pan have
   something to work with. Inline SVG data URI needs no file on disk —
   images/ isn't served yet (that lands in P2). Not styled with `.fig`
   (that class isn't ported yet either); this probe only needs something
   clickable that opens the lightbox. */
const CHART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <rect width="1200" height="700" fill="#161b28"/>
  <rect x="20" y="20" width="1160" height="660" fill="none" stroke="#4f8cff" stroke-width="6"/>
  <text x="600" y="370" font-size="54" fill="#e8b45a" text-anchor="middle" font-family="sans-serif">Probe chart</text>
</svg>`;
const CHART_SRC = `data:image/svg+xml,${encodeURIComponent(CHART_SVG)}`;

export default function CssProbe() {
  const { open } = useLightbox();

  return (
    <article className="lesson">
      <div className="lesson-hero">
        <div className="crumb">Month 4 · Lesson 3</div>
        <h1>Orderblocks</h1>
        <div className="desc">One-line summary.</div>
      </div>
      <h3>A sub-header</h3>
      <ul>
        <li>A list item with <strong>strong</strong> and <em>em</em>.</li>
      </ul>
      <div className="callout"><span className="tag">Note</span>Callout body.</div>
      <div className="callout rule"><span className="tag">Rule</span>Rule body.</div>
      <div className="callout warn"><span className="tag">Warn</span>Warn body.</div>
      <div className="kv">
        <div>Term</div><div>Definition</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CHART_SRC}
        alt="Probe chart"
        data-testid="probe-chart"
        style={{ cursor: "zoom-in", maxWidth: "100%", display: "block" }}
        onClick={() => open(CHART_SRC, "Probe chart")}
      />
      <div className="lesson-footer">
        <span />
        <button type="button" className="btn primary">Mark complete</button>
        <span />
      </div>
    </article>
  );
}
