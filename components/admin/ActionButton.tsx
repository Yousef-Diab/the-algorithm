"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/admin/action-result";
import styles from "./admin-forms.module.css";

/**
 * Renders the {ok, message} an action returns. This is why the wrappers exist:
 * promoteLessonDraft returns false for "no draft pending", and at the publish
 * gate a no-op that looks like success is the worst possible failure mode.
 */
export function ActionButton({
  action,
  label,
  hidden = {},
  disabled = false,
  testId = "action-result",
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  label: string;
  hidden?: Record<string, string>;
  /** "There is nothing to act on." A caller expresses that by DISABLING the
   *  button, never by unmounting this component: a Server Action whose own
   *  re-render removes the owner of its `useActionState` leaves the result
   *  nowhere to land, so `pending` never clears and the status region never
   *  paints. Keep the component mounted; gate it here. */
  disabled?: boolean;
  /** Distinct id for the result region. Every ActionButton renders a permanent
   *  role="status" span, so a shared testid matches all of them and breaks any
   *  strict-mode locator. Give a button its own when a test must address it. */
  testId?: string;
}) {
  // No confirmation prop: the only action needing one is discard, and
  // DiscardForm owns that with a typed id. An unused option here would be
  // dead surface.
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={styles.form}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" disabled={pending || disabled} className={styles.button}>
        {pending ? "working…" : label}
      </button>
      {/* Rendered unconditionally, even when empty: a live region must exist
          before its content changes for assistive tech to reliably announce
          the update — mounting it only once `state` is set means the very
          first result can go unannounced. */}
      <span className={state?.ok ? styles.ok : styles.err} role="status" data-testid={testId}>
        {state?.message ?? ""}
      </span>
    </form>
  );
}
