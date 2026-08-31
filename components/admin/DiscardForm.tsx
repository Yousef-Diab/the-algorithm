"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/lib/admin/action-result";
import { discardAction } from "@/app/admin/actions";
import styles from "./admin-forms.module.css";

/**
 * Discard is the one IRRECOVERABLE action here — it drops body_draft and
 * source_ref_draft and the prose is gone. Hence typing the id, not a click.
 * The server re-checks the confirmation too; this is convenience, not the gate.
 */
export function DiscardForm({ id }: { id: string }) {
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
      />
      <button type="submit" disabled={pending || typed !== id} className={styles.danger}>
        {pending ? "discarding…" : "Discard draft"}
      </button>
      {state ? (
        <span className={state.ok ? styles.ok : styles.err} role="status" data-testid="discard-result">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
