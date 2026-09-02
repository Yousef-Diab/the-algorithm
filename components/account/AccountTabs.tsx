"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AccountSettingsCards,
  ChangePasswordCard,
  SessionsCard,
  useAuthenticate,
} from "@neondatabase/auth/react/ui";
import { authClient } from "@/lib/auth/client";
import styles from "./AccountTabs.module.css";

/**
 * How young a sign-in must be for Neon Auth to serve `GET /list-sessions`:
 * its server guards that endpoint with Better Auth's fresh-session check, so
 * an older session gets a bare 403 "Session is not fresh". Probed against the
 * real backend — a 2-hour-old session is served, a 26-hour-old one is not —
 * which is Better Auth's own 24h `freshAge` default. Everything else this page
 * renders (name, password) is served at any age.
 */
const FRESH_AGE_MS = 24 * 60 * 60 * 1000;

const TABS = [
  { path: "settings", label: "Account" },
  { path: "security", label: "Security" },
] as const;

/**
 * The account surface, composed from the auth UI's own cards rather than its
 * `AccountView`: that view renders the sessions card unconditionally, so on an
 * aged session simply opening the Security tab fired a request that could only
 * 403 — and the failed read surfaced as an error toast on every tab switch.
 * Here the card is asked for only when the session is young enough to get an
 * answer, and the shortfall is explained in place instead.
 */
export function AccountTabs({ path }: { path: string }) {
  useAuthenticate();
  const { data: session } = authClient.useSession();

  const startedAt = session?.session?.createdAt;

  // Freshness is a fact about the clock, not about the props, so it is read
  // from a callback after mount (and re-read while the page stays open, since
  // a session left sitting here does cross the boundary). `null` means "not
  // decided yet" — neither branch renders until the session has loaded.
  const [isFresh, setIsFresh] = useState<boolean | null>(null);
  useEffect(() => {
    if (!startedAt) return;
    const started = new Date(startedAt).getTime();
    const check = () => setIsFresh(Date.now() - started < FRESH_AGE_MS);
    const first = setTimeout(check, 0);
    const repeat = setInterval(check, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(repeat);
    };
  }, [startedAt]);

  const view = path === "security" ? "security" : "settings";

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav} aria-label="Account settings">
        {TABS.map((tab) => (
          <Link
            key={tab.path}
            href={`/account/${tab.path}`}
            className={styles.tab}
            aria-current={view === tab.path ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className={styles.cards}>
        {view === "settings" ? (
          <AccountSettingsCards />
        ) : (
          <>
            <ChangePasswordCard />
            {isFresh === true && <SessionsCard />}
            {isFresh === false && (
              <div className={styles.notice}>
                <h3>Active sessions</h3>
                <p>
                  Signed-in devices are only listed for a sign-in less than 24 hours old. Sign
                  in again to see and revoke your sessions.
                </p>
                <Link className={styles.noticeAction} href="/auth/sign-out">
                  Sign out and sign in again
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
