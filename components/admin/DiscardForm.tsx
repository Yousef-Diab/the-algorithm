"use client";

import { useActionState, useState } from "react";
import { discardAction } from "@/app/admin/actions";
import styles from "./admin-forms.module.css";

/**
 * Discard is the one IRRECOVERABLE action here — it drops body_draft and
 * source_ref_draft and the prose is gone. Hence typing the id, not a click.
 * The server re-checks the confirmation too; this is convenience, not the gate.
 *
 * `disabled` means "no draft is pending". The caller must express that by
 * disabling this form rather than unmounting it: a successful discard flips
 * the page's `hasDraft` to false, and if that re-render removed this
 * component, the discard's own result would have nowhere to land — the button
 * would stick on "discarding…" and the status region would stay empty even
 * though the draft was already gone.
 *
 * `describedBy` points at the caller's explanation of that disabled state, so
 * a control no keyboard user can reach still says why.
 *
 * `typed` must not survive past the draft it was confirmed for. Once this
 * form goes disabled — the draft it was confirming against is gone, whether
 * because THIS discard just succeeded or for any other reason — the typed
 * confirmation is cleared. That closes the gap: a later render that flips
 * `disabled` back to false (an agent wrote a NEW draft) then starts from an
 * empty `typed`, so the id the admin typed for the previous draft can never
 * silently satisfy the confirmation for one they have not seen.
 *
 * This clears by adjusting state during render (comparing `disabled` to a
 * mirrored previous value, React's documented alternative to a `setState`
 * inside `useEffect`), not a remount-on-`key`: the whole form — and the
 * `useActionState` result it owns — must stay mounted across the very
 * re-render this discard's own success causes, or the "discarding…" → result
 * transition never lands, exactly the bug the block comment above describes.
 * Keying the form on per-draft identity would remount it on that same
 * transition, since `disabled` flips true in the same render the success
 * message arrives in — so clearing `typed` has to happen without unmounting.
 */
export function DiscardForm({
  id,
  disabled = false,
  describedBy,
}: {
  id: string;
  disabled?: boolean;
  describedBy?: string;
}) {
  const [state, formAction, pending] = useActionState(discardAction, null);
  const [typed, setTyped] = useState("");

  // Adjusting state during render, not in an effect: when `disabled` flips
  // (in either direction) this clears `typed` in the same render pass, before
  // anything commits — so a stale confirmation can never be visible, even for
  // one frame, once a new draft makes the form enabled again.
  const [prevDisabled, setPrevDisabled] = useState(disabled);
  if (disabled !== prevDisabled) {
    setPrevDisabled(disabled);
    setTyped("");
  }

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
      <button
        type="submit"
        disabled={disabled || pending || typed !== id}
        aria-describedby={describedBy}
        className={styles.danger}
      >
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
