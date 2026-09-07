import { Fragment } from "react";
import type { Inline } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import styles from "./Kv.module.css";

/**
 * `Kv.module.css` targets `.key`/`.val` with `:nth-last-child()` selectors, so
 * each row's two cells must be direct children of `.kv` in the DOM — a
 * wrapper div (even with `display: contents`) would make them siblings of
 * each other instead, breaking the last-row border removal. A fragment keeps
 * them flat.
 */
export function Kv({ rows }: { rows: { k: Inline[]; v: Inline[] }[] }) {
  return (
    <div className={styles.kv}>
      {rows.map((r, i) => (
        <Fragment key={i}>
          <div className={styles.key}>
            <InlineNodes nodes={r.k} />
          </div>
          <div className={styles.val}>
            <InlineNodes nodes={r.v} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}
