import type { Block } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import { Callout } from "./Callout";
import { Kv } from "./Kv";
import { FlipRow, FlipHint } from "./FlipCard";
import { Figures } from "./Figures";

/**
 * Block array → React tree. Pure: every data dependency arrives as a prop, so
 * this is unit-testable with renderToStaticMarkup and has no DB access.
 */
export function BlockRenderer({ blocks, lessonId }: { blocks: Block[]; lessonId: string }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h3":
            return <h3 key={i}><InlineNodes nodes={b.c} /></h3>;
          case "h4":
            return <h4 key={i}><InlineNodes nodes={b.c} /></h4>;
          case "p":
            return <p key={i}><InlineNodes nodes={b.c} /></p>;
          case "list":
            return b.ordered ? (
              <ol key={i}>{b.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ol>
            ) : (
              <ul key={i}>{b.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ul>
            );
          case "callout":
            return <Callout key={i} variant={b.variant} tag={b.tag}>{b.c}</Callout>;
          case "kv":
            return <Kv key={i} rows={b.rows} />;
          case "flipRow":
            return <FlipRow key={i} cards={b.cards} />;
          case "flipHint":
            return <FlipHint key={i} text={b.v} />;
          case "figures":
            return <Figures key={i} slug={b.slug} lessonId={lessonId} />;
        }
      })}
    </>
  );
}
