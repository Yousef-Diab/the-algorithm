/**
 * Carries "this address is waiting on a sign-up code" across the hop that the
 * auth UI performs after sign-up.
 *
 * Why this exists: Neon Auth is configured with
 * `email_verification_method: "otp"`, because verification *links* require a
 * custom email provider and this project uses Neon's shared sender. So a new
 * account receives a 6-digit code. The auth UI library
 * (@daveyplate/better-auth-ui, re-exported as NeonAuthUIProvider) has no screen
 * for entering that code — its own `email-otp` view only does OTP *sign-in*
 * (`type: "sign-in"`), it never calls `emailOtp.verifyEmail` — and its sign-up
 * handler unconditionally lands the user on /auth/sign-in with a hardcoded
 * "check your email for the verification link" toast. That dead-ends every new
 * user. The app therefore remembers the address itself and sends them to its
 * own /auth/verify-email screen.
 *
 * Stored in sessionStorage, never a cookie: it is a UI breadcrumb rather than a
 * credential (knowing the address grants nothing — the code still has to match),
 * and it must not outlive the tab.
 *
 * Everything here is pure or takes its storage as an argument, so it is testable
 * under the node-environment unit suite.
 */

export const PENDING_KEY = "ict-pending-verify";

/** Neon expires both codes and links after 15 minutes; match that. */
export const PENDING_TTL_MS = 15 * 60 * 1000;

export const AUTH_BASE_PATH = "/auth";
export const SIGN_IN_PATH = `${AUTH_BASE_PATH}/sign-in`;
export const VERIFY_EMAIL_PATH = `${AUTH_BASE_PATH}/verify-email`;

/** The slice of the Storage API this module needs — keeps tests trivial. */
export type PendingStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type PendingRecord = {
  email: string;
  at: number;
  /**
   * True until the record has been used to redirect once. Without this the
   * 15-minute record would bounce EVERY later navigation to /auth/sign-in back
   * to the verify screen — including the user deliberately clicking "Sign in"
   * from it.
   */
  divert: boolean;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

export function encodePending(email: string, now: number = Date.now(), divert = true): string {
  return JSON.stringify({ email, at: now, divert } satisfies PendingRecord);
}

/** Parses a stored record, returning null for anything malformed or expired. */
export function decodePending(
  raw: string | null | undefined,
  now: number = Date.now(),
): PendingRecord | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const record = asRecord(parsed);
  if (!record) return null;
  const { email, at, divert } = record;
  if (typeof email !== "string" || email === "") return null;
  if (typeof at !== "number" || !Number.isFinite(at)) return null;
  // Math.abs also rejects timestamps from the future, which mean a clock change
  // rather than a fresh code.
  if (Math.abs(now - at) > PENDING_TTL_MS) return null;
  return { email, at, divert: divert === true };
}

/**
 * Decides whether a sign-up response left the account unverified.
 *
 * Deliberately conservative: an unrecognised payload returns false, because
 * wrongly diverting an already-signed-in user to a "verify your email" screen
 * is a worse failure than leaving the library's own flow alone.
 */
export function needsEmailVerification(result: unknown): boolean {
  const top = asRecord(result);
  if (!top) return false;
  // `{ data, error }` shape (no `throw`): a failed sign-up created no account.
  if (top.error != null) return false;
  const payload = asRecord(top.data) ?? top;
  // A session token means the server signed them straight in — nothing pending.
  if (typeof payload.token === "string" && payload.token !== "") return false;
  const user = asRecord(payload.user);
  if (!user) return false;
  return user.emailVerified !== true;
}

/**
 * Rewrites the href the auth UI wants to navigate to after sign-up.
 *
 * Only the sign-in hop is redirected, and only when a code is actually pending;
 * every other navigation passes through untouched.
 */
export function divertToVerifyEmail(href: string, pendingEmail: string | null): string {
  if (!pendingEmail) return href;
  // The library only ever passes same-origin relative hrefs. An absolute URL is
  // something else entirely, so leave it alone rather than rewriting it.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return href;
  let url: URL;
  try {
    url = new URL(href, "http://local");
  } catch {
    return href;
  }
  if (url.pathname !== SIGN_IN_PATH) return href;
  url.pathname = VERIFY_EMAIL_PATH;
  url.searchParams.set("email", pendingEmail);
  return `${url.pathname}${url.search}`;
}

/** sessionStorage when it is usable, null otherwise (SSR, or blocked by the browser). */
export function sessionStore(): PendingStore | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function rememberPending(
  email: string,
  store: PendingStore | null = sessionStore(),
  now: number = Date.now(),
): void {
  if (!store) return;
  try {
    store.setItem(PENDING_KEY, encodePending(email, now));
  } catch {
    // A full or blocked store costs the prefill, not the flow: the verify
    // screen still asks for the address.
  }
}

/** The pending address, for prefilling the verify form. Does not consume it. */
export function readPending(
  store: PendingStore | null = sessionStore(),
  now: number = Date.now(),
): string | null {
  if (!store) return null;
  try {
    return decodePending(store.getItem(PENDING_KEY), now)?.email ?? null;
  } catch {
    return null;
  }
}

/**
 * The pending address if it has not yet been used to redirect — and marks it
 * used, so only the first post-sign-up navigation is diverted.
 */
export function consumeDivert(
  store: PendingStore | null = sessionStore(),
  now: number = Date.now(),
): string | null {
  if (!store) return null;
  try {
    const record = decodePending(store.getItem(PENDING_KEY), now);
    if (!record || !record.divert) return null;
    store.setItem(PENDING_KEY, encodePending(record.email, record.at, false));
    return record.email;
  } catch {
    return null;
  }
}

export function clearPending(store: PendingStore | null = sessionStore()): void {
  if (!store) return;
  try {
    store.removeItem(PENDING_KEY);
  } catch {
    // Nothing to do — the record expires on its own, and with the tab.
  }
}
