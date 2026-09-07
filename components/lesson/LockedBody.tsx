import Link from "next/link";
import styles from "./LockedBody.module.css";

export function LockedBody({ signedIn }: { signedIn: boolean }) {
  return (
    <div className={styles.locked}>
      <h3>This lesson is for members</h3>
      <p>
        {signedIn
          ? "Your account doesn't have access to this section yet."
          : "Sign in with a member account to read this lesson, study its charts and take the lesson check."}
      </p>
      {signedIn ? null : (
        <Link className="btn primary" href="/auth/sign-in">
          Sign in
        </Link>
      )}
    </div>
  );
}
