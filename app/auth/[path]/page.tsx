import { AuthView } from "@neondatabase/auth/react/ui";
import styles from "./auth.module.css";
import shell from "@/app/shell.module.css";

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "sign-out" },
    { path: "forgot-password" },
    { path: "reset-password" },
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
        <AuthView path={path} />
      </main>
    </div>
  );
}
