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
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  label: string;
  hidden?: Record<string, string>;
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
      <button type="submit" disabled={pending} className={styles.button}>
        {pending ? "working…" : label}
      </button>
      {state ? (
        <span className={state.ok ? styles.ok : styles.err} role="status" data-testid="action-result">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
