"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@neondatabase/auth/react/ui";
import styles from "./AuthControls.module.css";

/** Minimal account control for the sidebar header: the account avatar when
 *  signed in, a small "Sign in" link otherwise. Rendered only when Neon Auth
 *  is configured (so the provider is present above it). */
export function AuthControls() {
  return (
    <div className={styles.wrap}>
      <SignedIn>
        <UserButton size="icon" />
      </SignedIn>
      <SignedOut>
        <Link className={styles.signin} href="/auth/sign-in">
          Sign in
        </Link>
      </SignedOut>
    </div>
  );
}
