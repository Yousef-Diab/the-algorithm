"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { SIGN_IN_PATH, clearPending, readPending } from "@/lib/auth/pending-verification";
import styles from "./VerifyEmailForm.module.css";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_S = 60;

type Feedback = { tone: "error" | "info"; text: string } | null;

/** Pulls a human-readable message out of whatever the auth client rejected with. */
function errorText(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const { message } = error as { message?: unknown };
    if (typeof message === "string" && message !== "") return message;
  }
  return fallback;
}

/* The breadcrumb is written before this screen mounts and never changes while
   it is open, so there is nothing to subscribe to. Reading it through
   useSyncExternalStore rather than an effect keeps the prerendered HTML (which
   has no sessionStorage) free of a hydration mismatch. */
const noSubscription = () => () => {};
const pendingEmail = () => readPending() ?? "";
const noPendingEmail = () => "";

/**
 * Entering the 6-digit code Neon Auth emails on sign-up.
 *
 * The auth UI library has no such screen — its `email-otp` view sends and
 * verifies a *sign-in* code (`type: "sign-in"`), which will not match the
 * `email-verification` code from the sign-up email — so this calls
 * `emailOtp.verifyEmail` directly. See lib/auth/pending-verification.ts for why
 * the flow needs it at all.
 */
export function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  // The address comes from the URL on the ordinary post-sign-up hop. Someone
  // arriving later — from the sign-in page, or a reopened tab — still has the
  // sessionStorage breadcrumb; failing both, they type it in.
  const remembered = useSyncExternalStore(noSubscription, pendingEmail, noPendingEmail);
  const [typedEmail, setTypedEmail] = useState<string | null>(null);
  const email = typedEmail ?? params.get("email") ?? remembered;
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function rejected(error: unknown, fallback: string) {
    setFeedback({ tone: "error", text: errorText(error, fallback) });
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    const failed = (error: unknown) => {
      rejected(error, "That code did not work. Try again.");
      setCode("");
      codeRef.current?.focus();
    };
    try {
      const response = await authClient.emailOtp.verifyEmail({ email: email.trim(), otp: code });
      // The auth client either rejects on failure or resolves with an `error`
      // depending on how it was configured; treat the two identically.
      const error = (response as { error?: unknown } | undefined)?.error;
      if (error) {
        failed(error);
        return;
      }
      const data = (response as { data?: unknown } | undefined)?.data ?? response;
      clearPending();
      // Neon Auth signs the user in on verification (auto_sign_in_after_verification),
      // in which case a token comes back and the session is already live. Without
      // one, the account is verified but they still have to sign in.
      if (data && typeof (data as { token?: unknown }).token === "string") {
        router.push("/");
        router.refresh();
      } else {
        router.push(SIGN_IN_PATH);
      }
    } catch (error) {
      failed(error);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (busy || cooldown > 0 || !email.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "email-verification",
      });
      const error = (response as { error?: unknown } | undefined)?.error;
      if (error) {
        rejected(error, "Could not send a new code.");
        return;
      }
      setCooldown(RESEND_COOLDOWN_S);
      setFeedback({ tone: "info", text: "A new code is on its way." });
    } catch (error) {
      rejected(error, "Could not send a new code.");
    } finally {
      setBusy(false);
    }
  }

  const ready = code.length === CODE_LENGTH && email.trim() !== "";

  return (
    <form className={styles.card} onSubmit={verify} noValidate>
      <h2 className={styles.title}>Verify your email</h2>
      <p className={styles.lede}>
        Enter the {CODE_LENGTH}-digit code we emailed you. It expires 15 minutes after it is sent.
      </p>

      <label className={styles.label} htmlFor="verify-email">
        Email
      </label>
      <input
        id="verify-email"
        className={styles.input}
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setTypedEmail(e.target.value)}
      />

      <label className={styles.label} htmlFor="verify-code">
        Verification code
      </label>
      <input
        id="verify-code"
        ref={codeRef}
        className={`${styles.input} ${styles.code}`}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH}
        required
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
      />

      {feedback && (
        <p className={feedback.tone === "error" ? styles.error : styles.info} role="status">
          {feedback.text}
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={!ready || busy}>
        {busy ? "Working…" : "Verify email"}
      </button>

      <div className={styles.foot}>
        <button className={styles.link} type="button" onClick={resend} disabled={busy || cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Send a new code"}
        </button>
        <Link className={styles.link} href={SIGN_IN_PATH}>
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
