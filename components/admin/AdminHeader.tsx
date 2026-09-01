import Link from "next/link";
import styles from "./admin-forms.module.css";

/**
 * The admin console's own chrome, since the public site sidebar is hidden on
 * /admin (see components/shell/Sidebar.tsx).
 *
 * Rendered EXPLICITLY by each admin page rather than from an
 * app/admin/layout.tsx. That is deliberate: "there is no admin layout" is the
 * property that keeps invariant 11 unambiguous — every admin page calls
 * requireAdminPage() itself. A presentational admin layout is exactly the file
 * someone later hangs an auth check on, or assumes already carries one.
 *
 * Server component: no state, no interactivity, nothing to hydrate.
 */
export function AdminHeader({ current }: { current?: string }) {
  return (
    <header className={styles.adminHeader}>
      <Link href="/admin" className={styles.adminBrand}>
        Admin console
      </Link>
      {current ? <span className={styles.adminCrumb}>{current}</span> : null}
      <Link href="/" className={styles.adminExit}>
        View site →
      </Link>
    </header>
  );
}
