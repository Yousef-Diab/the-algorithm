import { Suspense } from "react";
import Link from "next/link";
import { AuthView } from "@neondatabase/auth/react/ui";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import styles from "./auth.module.css";
import shell from "@/app/shell.module.css";

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "sign-out" },
    { path: "forgot-password" },
    { path: "reset-password" },
    { path: "email-otp" },
    { path: "verify-email" },
    { path: "callback" },
    { path: "settings" },
  ];
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <div className={shell.inner}>
      <main className={styles.authWrap}>
        {path === "verify-email" ? (
          // The app's own screen: the auth UI library has no view for entering
          // the sign-up verification code Neon Auth emails.
          <Suspense fallback={null}>
            <VerifyEmailForm />
          </Suspense>
        ) : (
          <div className={styles.stack}>
            <AuthView path={path} />
            {path === "sign-in" && (
              // A signed-up-but-unverified account cannot sign in, and the error
              // it gets is a dead end without somewhere to spend the code.
              <Link className={styles.aside} href="/auth/verify-email">
                Have a verification code?
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
