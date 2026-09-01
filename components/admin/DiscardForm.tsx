"use client";

import { useActionState, useState } from "react";
import { discardAction } from "@/app/admin/actions";
import styles from "./admin-forms.module.css";

/**
 * Discard is the one IRRECOVERABLE action here — it drops body_draft and
 * source_ref_draft and the prose is gone. Hence typing the id, not a click.
 * The server re-checks the confirmation too; this is convenience, not the gate.
 */
/**
 * `disabled` means "no draft is pending". The caller must express that by
 * disabling this form rather than unmounting it: a successful discard flips
 * the page's `hasDraft` to false, and if that re-render removed this
 * component, the discard's own result would have nowhere to land — the button
 * would stick on "discarding…" and the status region would stay empty even
 * though the draft was already gone.
 */
export function DiscardForm({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(discardAction, null);
  const [typed, setTyped] = useState("");
  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={id} />
      <label className={styles.label} htmlFor="confirm">
        Type <code>{id}</code> to discard this draft permanently
      </label>
      <input
        id="confirm"
        name="confirm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className={styles.input}
        autoComplete="off"
        disabled={disabled}
      />
      {/* The typed-id confirmation is still required, and the server re-checks
          it independently (app/admin/actions.ts rejects a mismatch and an
          empty id) — this disabled state is convenience, not the gate. */}
      <button type="submit" disabled={disabled || pending || typed !== id} className={styles.danger}>
        {pending ? "discarding…" : "Discard draft"}
      </button>
      {/* Rendered unconditionally, even when empty — see ActionButton.tsx for
          why a live region must exist before its content changes. */}
      <span className={state?.ok ? styles.ok : styles.err} role="status" data-testid="discard-result">
        {state?.message ?? ""}
      </span>
    </form>
  );
}
