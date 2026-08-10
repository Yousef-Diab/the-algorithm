"use client";

import { useState } from "react";
import type { Inline } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import styles from "./FlipCard.module.css";

export function FlipRow({ cards }: { cards: { front: Inline[]; back: Inline[] }[] }) {
  return (
    <div className={styles.row}>
      {cards.map((c, i) => (
        <Flip key={i} front={c.front} back={c.back} />
      ))}
    </div>
  );
}

function Flip({ front, back }: { front: Inline[]; back: Inline[] }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      className={`${styles.flip} ${flipped ? styles.flipped : ""}`}
      onClick={() => setFlipped((v) => !v)}
      aria-pressed={flipped}
    >
      <span className={styles.inner}>
        <span className={`${styles.face} ${styles.front}`}><InlineNodes nodes={front} /></span>
        <span className={`${styles.face} ${styles.back}`}><InlineNodes nodes={back} /></span>
      </span>
    </button>
  );
}

/** The source authors this hint separately (it is not always adjacent). */
export function FlipHint({ text }: { text: string }) {
  return <div className={styles.hint}>{text}</div>;
}
