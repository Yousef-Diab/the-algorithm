import type { Inline } from "@/lib/content/blocks";
import styles from "./Callout.module.css";

/** Inline nodes → React. Pure and server-safe; no data dependencies. */
export function InlineNodes({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case "text":
            return n.v;
          case "br":
            return <br key={i} />;
          case "strong":
            return (
              <strong key={i}>
                <InlineNodes nodes={n.c} />
              </strong>
            );
          case "em":
            return (
              <em key={i}>
                <InlineNodes nodes={n.c} />
              </em>
            );
          case "src":
            return (
              <span key={i} className={styles.src}>
                <InlineNodes nodes={n.c} />
              </span>
            );
        }
      })}
    </>
  );
}
