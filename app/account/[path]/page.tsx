import { AccountTabs } from "@/components/account/AccountTabs";
import styles from "./account.module.css";
import shell from "@/app/shell.module.css";

/** The account pages the auth UI's own links point at: the avatar menu's
 *  "Settings" goes to /account/settings, and the tab nav to /account/security.
 *  Without these routes both are 404s. */
export function generateStaticParams() {
  return [{ path: "settings" }, { path: "security" }];
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <div className={shell.inner}>
      {/* A section, not a <main>: the app shell already provides the page's
          single <main> landmark. */}
      <section className={styles.accountWrap} aria-label="Account">
        <AccountTabs path={path} />
      </section>
    </div>
  );
}
