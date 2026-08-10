import type { Metadata } from "next";
import "./globals.css";
import { LightboxProvider } from "@/components/lightbox/LightboxProvider";
import { isAuthConfigured } from "@/lib/auth/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import styles from "./shell.module.css";

const FAVICON = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20rx='7'%20fill='%230b0e14'/%3E%3Crect%20x='.75'%20y='.75'%20width='30.5'%20height='30.5'%20rx='6.25'%20fill='none'%20stroke='%23232b3d'%20stroke-width='1.5'/%3E%3Cpath%20d='M7%2025.5%2016%206.5%2025%2025.5'%20fill='none'%20stroke='%23e8b45a'%20stroke-width='3'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3Cpath%20d='M9.9%2019.7h12.2'%20fill='none'%20stroke='%234f8cff'%20stroke-width='3'%20stroke-linecap='round'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "The Algorithm — Learning how price is really delivered",
  description: "An interactive course built from ICT's Mentorships.",
  icons: { icon: FAVICON },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const shell = (
    <LightboxProvider>
      <div className={styles.app}>
        <main className={styles.main}>
          <div className={styles.inner}>{children}</div>
        </main>
      </div>
    </LightboxProvider>
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{isAuthConfigured ? <AuthProvider>{shell}</AuthProvider> : shell}</body>
    </html>
  );
}
