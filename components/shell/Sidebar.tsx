"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { CatalogSection } from "@/lib/content/queries";
import { useProgress } from "@/components/progress/ProgressProvider";
import { AuthControls } from "@/components/auth/AuthControls";
import styles from "./Sidebar.module.css";

export function Sidebar({
  catalog,
  authEnabled = false,
}: {
  catalog: CatalogSection[];
  authEnabled?: boolean;
}) {
  const pathname = usePathname();
  const { isDone, count, ready } = useProgress();
  const [open, setOpen] = useState(false);

  const activeId = pathname?.startsWith("/lesson/")
    ? decodeURIComponent(pathname.slice("/lesson/".length))
    : null;

  const total = catalog.flatMap((s) => s.months).flatMap((m) => m.lessons).length;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <>
      <button
        className={styles.menuToggle}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle lessons menu"
      >
        ☰ Lessons
      </button>
      <nav className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandTop}>
            <div className={styles.brandText}>
              <h1 className={styles.brandTitle}>
                <Link href="/" onClick={() => setOpen(false)}>
                  The <span>Algorithm</span>
                </Link>
              </h1>
              <div className={styles.sub}>Interactive course · built from ICT&apos;s Mentorships</div>
            </div>
            {authEnabled ? <AuthControls /> : null}
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.progressLabel}>
              {ready ? count : 0} / {total} lessons complete
            </div>
          </div>
        </div>

        <div className={styles.navList}>
          {catalog.map((s) => (
            <div key={s.id}>
              {/* only label sections once there is more than one of them */}
              {catalog.length > 1 ? <div className={styles.sectionHead}>{s.short || s.title}</div> : null}

              {s.months.map((month) => {
                const doneCount = ready ? month.lessons.filter((l) => isDone(l.id)).length : 0;
                return (
                  <div key={month.id} className={styles.monthGroup}>
                    <div className={styles.monthHead}>
                      <h2>{month.title.split("—")[0].trim()}</h2>
                      <span className={styles.count}>
                        {doneCount}/{month.lessons.length}
                      </span>
                    </div>
                    {month.lessons.map((lesson, i) => {
                      const active = lesson.id === activeId;
                      const complete = ready && isDone(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/lesson/${lesson.id}`}
                          onClick={() => setOpen(false)}
                          className={`${styles.navLesson} ${active ? styles.active : ""} ${
                            complete ? styles.doneItem : ""
                          }`}
                        >
                          <span className={styles.dot}>{complete ? "✓" : ""}</span>
                          <span className={styles.n}>{i + 1}</span>
                          <span>{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}

              {s.review || s.exam ? (
                <div className={styles.monthGroup}>
                  <div className={`${styles.monthHead} ${styles.reviewHead}`}>
                    <h2>{(s.short || s.title) + " · Review"}</h2>
                  </div>
                  {[s.review, s.exam].map((entry) => {
                    if (!entry) return null;
                    const active = entry.id === activeId;
                    return (
                      <Link
                        key={entry.id}
                        href={`/lesson/${entry.id}`}
                        onClick={() => setOpen(false)}
                        className={`${styles.navLesson} ${active ? styles.active : ""}`}
                      >
                        <span className={`${styles.dot} ${styles.rdot}`}>◆</span>
                        <span className={styles.n} />
                        <span>{entry.title}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
