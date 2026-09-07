"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/admin/action-result";
import { nextStatus, statusToggleLabel } from "@/lib/admin/status";
import { setStatusAction, setAccessAction } from "@/app/admin/actions";
import styles from "./admin-forms.module.css";

const ACCESSES = ["free", "members", "admin"] as const;

/**
 * The status and access controls for ONE row of the admin lesson list.
 *
 * Both controls reuse app/admin/actions.ts unchanged — the same authorized,
 * audited Server Actions the detail page uses. This component adds a surface,
 * never a second authorization path: `assertAdmin()` still runs inside each
 * action, and a POST that skips this UI entirely is refused exactly the same way.
 *
 * ONE shared role="status" region for the row rather than one per control: the
 * list renders 82 rows, and per-control regions would put 160+ live regions on
 * the page, which is worse than useless to a screen reader.
 *
 * Promote and discard are deliberately NOT here. They only mean anything beside
 * the rendered side-by-side diff, which is the detail page's whole purpose.
 */
export function RowActions({
  id,
  status,
  access,
}: {
  id: string;
  status: string;
  access: string;
}) {
  const [statusState, statusForm, statusPending] = useActionState(setStatusAction, null);
  const [accessState, accessForm, accessPending] = useActionState(setAccessAction, null);

  // Whichever control last reported wins the shared region. Both are one-shot,
  // so they cannot meaningfully report at the same time.
  const shown: ActionResult | null = statusState ?? accessState;

  return (
    <div className={styles.rowActions}>
      <form action={statusForm}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value={nextStatus(status)} />
        <button type="submit" disabled={statusPending} className={styles.rowButton}>
          {statusPending ? "…" : statusToggleLabel(status)}
        </button>
      </form>

      <form action={accessForm}>
        <input type="hidden" name="id" value={id} />
        {/* aria-label, NOT a visually-hidden <label> element. A label would put
            the lesson id into the row's TEXT content, and the list already has
            a test locating a row by its id text — a second text node containing
            it makes that locator ambiguous. An attribute gives assistive tech
            the same per-row name without adding matchable text. */}
        {/* Deliberately NO `id` attribute. A lesson with a pending draft is
            rendered TWICE on this page — once in the "Pending review" shortcut
            group and once in its section/month group — so any per-row DOM id
            would appear twice, which is invalid HTML and breaks the very
            label/aria association it exists to provide. */}
        <select
          aria-label={`Access for ${id}`}
          name="access"
          defaultValue={access}
          disabled={accessPending}
          className={styles.rowSelect}
        >
          {ACCESSES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {/* An explicit Apply, deliberately NOT submit-on-change.
            A `change` event is something the browser itself can produce —
            form-state restoration on reload or history navigation, autofill, an
            extension — and this page renders one of these controls per lesson.
            Writing content access on an event we did not originate, 82 times
            over, is not a risk worth the one saved click. A submit button
            requires a real activation. */}
        <button type="submit" disabled={accessPending} className={styles.rowButton}>
          {accessPending ? "…" : "Apply"}
        </button>
      </form>

      {/* Rendered unconditionally: a live region has to exist BEFORE its content
          changes for assistive tech to announce the update. */}
      <span
        className={shown?.ok ? styles.ok : styles.err}
        role="status"
        data-testid={`row-result-${id}`}
      >
        {shown?.message ?? ""}
      </span>
    </div>
  );
}
