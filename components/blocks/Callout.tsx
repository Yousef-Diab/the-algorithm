import type { CalloutChild, Inline } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import styles from "./Callout.module.css";

const variantClass = { note: styles.note, rule: styles.rule, warn: styles.warn } as const;

export function Callout({
  variant,
  tag,
  children,
}: {
  variant: "note" | "rule" | "warn";
  tag: Inline[];
  children: CalloutChild[];
}) {
  return (
    <div className={`${styles.callout} ${variantClass[variant]}`}>
      <span className={styles.tag}>
        <InlineNodes nodes={tag} />
      </span>
      {children.map((c, i) =>
        c.t === "run" ? (
          <InlineNodes key={i} nodes={c.c} />
        ) : c.ordered ? (
          <ol key={i}>{c.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ol>
        ) : (
          <ul key={i}>{c.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ul>
        ),
      )}
    </div>
  );
}
