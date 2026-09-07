import Link from "next/link";
import styles from "./quiz.module.css";

export function QuizGate() {
  return (
    <section className={styles.gate} aria-label="Lesson quiz">
      <h3>Check yourself</h3>
      <p>The lesson check is for members — sign in to test yourself on this lesson.</p>
      <Link className="btn primary" href="/auth/sign-in">
        Sign in
      </Link>
    </section>
  );
}
