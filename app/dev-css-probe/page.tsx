export default function CssProbe() {
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
      <div className="lesson-footer">
        <span />
        <button type="button" className="btn primary">Mark complete</button>
        <span />
      </div>
    </article>
  );
}
