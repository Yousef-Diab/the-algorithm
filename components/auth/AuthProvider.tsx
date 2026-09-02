"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import "@neondatabase/auth/ui/css";
import { authClient } from "@/lib/auth/client";
import { consumeDivert, divertToVerifyEmail } from "@/lib/auth/pending-verification";

/**
 * Copy the UI library gets wrong for this project.
 *
 * Its defaults describe a verification *link*, but Neon Auth sends a 6-digit
 * code here — links need a custom email provider and this project uses Neon's
 * shared sender. Module-level so the object identity is stable; the provider
 * memoises on it.
 */
const localization = {
  SIGN_UP_EMAIL: "Check your email for a 6-digit verification code.",
  EMAIL_NOT_VERIFIED:
    "Email not verified yet. Check your inbox for a 6-digit code, then enter it on the verification page.",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  /**
   * After sign-up the library always heads for /auth/sign-in, where a new user
   * can do nothing but fail — the account is unverified and the code has
   * nowhere to go. Send that one hop to the app's own verification screen
   * instead. `consumeDivert` fires once, so every later trip to sign-in
   * (including from the verify screen itself) behaves normally.
   */
  const redirect = useCallback(
    (go: (href: string) => void, href: string) => go(divertToVerifyEmail(href, consumeDivert())),
    [],
  );
  const navigate = useCallback(
    (href: string) => redirect((to) => router.push(to), href),
    [redirect, router],
  );
  const replace = useCallback(
    (href: string) => redirect((to) => router.replace(to), href),
    [redirect, router],
  );

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      defaultTheme="dark"
      // Email/password sign-up with a confirm-password field…
      credentials={{ confirmPassword: true }}
      // …then require the user to verify their email via an emailed OTP code.
      emailOTP
      emailVerification
      // The auth UI shows a change-email card by default, but this Neon Auth
      // project has the endpoint switched off — submitting it can only answer
      // "Change email is disabled", so the card is not offered.
      changeEmail={false}
      localization={localization}
      navigate={navigate}
      replace={replace}
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
