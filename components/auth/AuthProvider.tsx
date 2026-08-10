"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import "@neondatabase/auth/ui/css";
import { authClient } from "@/lib/auth/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      defaultTheme="dark"
      // Email/password sign-up with a confirm-password field…
      credentials={{ confirmPassword: true }}
      // …then require the user to verify their email via an emailed OTP code.
      emailOTP
      emailVerification
      navigate={router.push}
      replace={router.replace}
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
