import type { Metadata } from "next";
import "./globals.css";
import { LightboxProvider } from "@/components/lightbox/LightboxProvider";
import { isAuthConfigured } from "@/lib/auth/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProgressProvider } from "@/components/progress/ProgressProvider";
import { Sidebar } from "@/components/shell/Sidebar";
import { getCatalog } from "@/lib/content/queries";
import styles from "./shell.module.css";
import { Analytics } from "@vercel/analytics/next"

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

export const metadata: Metadata = {
  metadataBase,
  title: "The Algorithm — Learning how price is really delivered",
  description: "An interactive course built from ICT's Mentorships.",
  applicationName: "The Algorithm",
  openGraph: {
    title: "The Algorithm",
    description: "Learning how price is really delivered.",
    siteName: "The Algorithm",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Algorithm",
    description: "Learning how price is really delivered.",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalog();

  const shell = (
    <LightboxProvider>
      <ProgressProvider>
        <Analytics />
        <div className={styles.app}>
          <Sidebar catalog={catalog} authEnabled={isAuthConfigured} />
          <main className={styles.main}>{children}</main>
        </div>
      </ProgressProvider>
    </LightboxProvider>
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{isAuthConfigured ? <AuthProvider>{shell}</AuthProvider> : shell}</body>
    </html>
  );
}
