import Link from "next/link";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/guard";
import { listLessonsForConsole } from "@/lib/admin/console-queries";
import { groupLessons, type ConsoleLessonRow } from "@/lib/admin/group-lessons";
import styles from "./admin.module.css";

/**
 * Fully dynamic for the same reason app/lesson/[id]/page.tsx is: this route
 * reads cookies() via accessContext(), and on Next 16.2.11 a static-generation
 * attempt over that throws DynamicServerError which is never converted into a
 * per-request dynamic render — it escapes as an uncaught 500.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — The Algorithm",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // FIRST statement, before any query. There is deliberately no admin layout
  // doing this — a layout gate lets a future page inherit a check it never
  // called, and hidden UI is not authorization.
  await requireAdminPage();

  const rows = await listLessonsForConsole();
  const { pending, sections } = groupLessons(rows);

  return (
    <div className={styles.console}>
      <h1>Admin</h1>
      <p className={styles.sub}>
        {rows.length} lessons · {pending.length} pending review
      </p>

      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading">Pending review</h2>
        {pending.length === 0 ? (
          <p className={styles.empty} data-testid="no-pending">
            No drafts are waiting.
          </p>
        ) : (
          <LessonTable rows={pending} testid="pending-table" />
        )}
      </section>

      {sections.map((s) => (
        <section key={s.sectionId} aria-labelledby={`sec-${s.sectionId}`}>
          <h2 id={`sec-${s.sectionId}`}>{s.sectionId}</h2>
          {s.months.map((m) => (
            <div key={m.monthId}>
              <h3>{m.monthId}</h3>
              <LessonTable rows={m.lessons} />
            </div>
          ))}
          {s.sectionLevel.length > 0 ? (
            <div>
              <h3>Section pages</h3>
              <LessonTable rows={s.sectionLevel} />
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function LessonTable({ rows, testid }: { rows: ConsoleLessonRow[]; testid?: string }) {
  return (
    <table className={styles.table} data-testid={testid}>
      <thead>
        <tr>
          <th>id</th>
          <th>title</th>
          <th>status</th>
          <th>access</th>
          <th>draft</th>
          <th>origin</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l) => (
          <tr key={l.id} data-testid={`row-${l.id}`}>
            <td>
              <Link href={`/admin/lesson/${l.id}`}>{l.id}</Link>
            </td>
            <td>{l.title}</td>
            <td>{l.status}</td>
            <td>{l.access}</td>
            <td>{l.hasDraft ? <span className={styles.badge}>pending</span> : ""}</td>
            <td>{l.writeOrigin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
