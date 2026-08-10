"use client";

import Link from "next/link";
import { useProgress } from "@/components/progress/ProgressProvider";
import type { CatalogSection } from "@/lib/content/queries";
import styles from "./home.module.css";

export function SectionCards({ sections }: { sections: CatalogSection[] }) {
  const { isDone, ready } = useProgress();

  return (
    <>
      {sections.map((s) => (
        <section key={s.id} className={styles.sectionGroup}>
          {sections.length > 1 ? <h2 className={styles.sectionHead}>{s.title}</h2> : null}
          <div className={styles.cards}>
            {s.months.map((m, i) => {
              const first = m.lessons[0];
              const doneCount = ready ? m.lessons.filter((l) => isDone(l.id)).length : 0;
              const heading = m.title.replace(/^(?:Month|Part)\s*\d+\s*[—-]\s*/, "");
              const body = (
                <>
                  <div className={styles.mnum}>{s.label} {i + 1}</div>
                  <h3>{heading}</h3>
                  <p>{m.desc}</p>
                  <div className={styles.mprog}>{doneCount} / {m.lessons.length} complete</div>
                </>
              );
              return first ? (
                <Link key={m.id} href={`/lesson/${first.id}`} className={styles.card}>{body}</Link>
              ) : (
                <div key={m.id} className={`${styles.card} ${styles.cardInert}`} aria-disabled="true">{body}</div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
