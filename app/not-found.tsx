import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/shell/BackButton";
import shell from "@/app/shell.module.css";
import styles from "./not-found.module.css";

export const metadata: Metadata = { title: "Page not found — The Algorithm" };

export default function NotFound() {
  return (
    <div className={shell.inner}>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className={styles.glyph} aria-hidden="true">404</span>
          <div className={styles.body}>
            <div className={styles.crumb}>Error 404</div>
            <h1>
              This page isn&apos;t <em>in the course</em>.
            </h1>
            <p>
              The link may be out of date, or the lesson may have moved. Head back to the
              course home to pick up where you left off — your progress is saved.
            </p>
            <div className={styles.actions}>
              <Link href="/" className={`${styles.btn} ${styles.primary}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 9.5V21h14V9.5" />
                </svg>
                Back to home
              </Link>
              <BackButton className={styles.btn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
                Go back
              </BackButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
