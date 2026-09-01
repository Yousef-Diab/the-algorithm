import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/guard";
import { createAdminQueries } from "@/lib/content/admin-queries";
import { db } from "@/lib/db";
import { getLessonMedia } from "@/lib/content/queries";
import { figuresFromMedia } from "@/lib/content/figures";
import { assertBlocks, type Block } from "@/lib/content/blocks";
import { diffBlocks } from "@/lib/admin/block-diff";
import { fingerprint } from "@/lib/admin/fingerprint";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ActionButton } from "@/components/admin/ActionButton";
import { DiscardForm } from "@/components/admin/DiscardForm";
import { promoteAction, setStatusAction, setAccessAction } from "@/app/admin/actions";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

/** Ids for the aria-describedby wiring on the always-mounted draft controls. */
const NO_DRAFT_NOTE_ID = "draft-actions-unavailable";
const PROMOTE_BLOCKED_ID = "promote-blocked-reason";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Admin — ${id} — The Algorithm`, robots: { index: false, follow: false } };
}

/**
 * assertBlocks throws on malformed JSON. Catching it is load-bearing: an
 * uncaught throw in a Server Component is a 500 error page, which tells the
 * admin nothing. Caught, the block path (block[3]/run[1]) is reported at review
 * time — which is exactly where you want to find it.
 */
function parse(value: unknown): { blocks: Block[]; error: null } | { blocks: null; error: string } {
  try {
    return { blocks: assertBlocks(value), error: null };
  } catch (err) {
    return { blocks: null, error: err instanceof Error ? err.message : "unparseable" };
  }
}

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();

  const { id } = await params;
  const admin = createAdminQueries({ db });
  const row = await admin.getLessonForEdit(id);
  if (!row) notFound();

  const figures = figuresFromMedia(await getLessonMedia(id));
  const live = parse(row.body);
  const hasDraft = row.bodyDraft != null;
  const draft = hasDraft ? parse(row.bodyDraft) : null;
  const rows = live.blocks && draft?.blocks ? diffBlocks(live.blocks, draft.blocks) : null;
  // Gated on `rows`, NOT on `draft?.blocks`: `rows` is non-null only when BOTH
  // the live body and the draft parsed and the side-by-side actually rendered.
  // Gating on the draft alone let a malformed LIVE body promote a draft the
  // page had shown nothing of — that was C1. Do not "simplify" this back to
  // `draft?.blocks`.
  const canPromote = Boolean(rows);

  return (
    <div className={styles.console}>
      <AdminHeader current={row.id} />
      <h1>
        {row.id} — {row.title}
      </h1>
      <dl className={styles.meta}>
        <dt>status</dt><dd>{row.status}</dd>
        <dt>access</dt><dd>{row.access}</dd>
        <dt>origin</dt><dd>{row.writeOrigin}</dd>
        <dt>source_ref</dt><dd>{row.sourceRef ?? "—"}</dd>
        {hasDraft ? (<><dt>source_ref_draft</dt><dd>{row.sourceRefDraft ?? "—"}</dd></>) : null}
      </dl>

      <section className={styles.actions} aria-labelledby="lesson-actions-heading">
        <h2 id="lesson-actions-heading">Actions</h2>
        <ActionButton action={setStatusAction} label="Publish" hidden={{ id: row.id, status: "published" }} />
        <ActionButton action={setStatusAction} label="Unpublish" hidden={{ id: row.id, status: "draft" }} />
        <ActionButton action={setAccessAction} label="Access: free" hidden={{ id: row.id, access: "free" }} />
        <ActionButton action={setAccessAction} label="Access: members" hidden={{ id: row.id, access: "members" }} />
        <ActionButton action={setAccessAction} label="Access: admin" hidden={{ id: row.id, access: "admin" }} />
      </section>

      {/* Rendered UNCONDITIONALLY, and "nothing to act on" is expressed by
          DISABLING the buttons rather than removing them. Both of these forms
          own an in-flight `useActionState`, and a successful promote/discard
          flips `hasDraft` to false: when they lived inside a `hasDraft`
          conditional, the Server Action's own re-render unmounted the
          component that was waiting for that action's result. The result then
          had nowhere to land — the button stuck on "working…" forever and the
          role="status" region never painted, even though the mutation had
          already committed. At a publish gate that silence is the worst
          possible outcome, so these two components must stay mounted across
          the state change they cause. (Verified: moving the promote button out
          of the conditional, changing nothing else, made the hang vanish.) */}
      <section className={styles.actions} aria-labelledby="draft-actions-heading">
        <h2 id="draft-actions-heading">Draft actions</h2>
        {/* Says WHY the controls below are dead. A `disabled` control is out of
            the tab order and announces no reason on its own, and the page's
            `no-draft` paragraph is a sibling AFTER this section with no
            programmatic link to it — so this note lives inside the section and
            is wired to both controls via aria-describedby. */}
        {!hasDraft ? (
          <p id={NO_DRAFT_NOTE_ID} className={styles.note}>
            No draft pending — these actions are unavailable.
          </p>
        ) : null}
        <ActionButton
          action={promoteAction}
          label="Promote draft"
          // Two conjuncts, both load-bearing:
          //   `canPromote`  — do NOT drop this. `rows` (hence canPromote) is
          //     null when the LIVE body failed to parse even though the DRAFT
          //     parsed fine, and in that case `draft.blocks` alone would ship a
          //     VALID sha256 to the client. `disabled` is then the only thing
          //     standing between a devtools attribute-delete and promoting a
          //     body this console could not compare — and the server does not
          //     re-check it (promoteAction never inspects row.body). Withholding
          //     the fingerprint puts the C1 gate back on something unforgeable.
          //     No-op whenever the button is enabled.
          //   `draft?.blocks` — fingerprint() is over assertBlocks output, never
          //     the raw row.bodyDraft; the server hashes the normalised form.
          hidden={{ id: row.id, fingerprint: canPromote && draft?.blocks ? fingerprint(draft.blocks) : "" }}
          // Same gate as before, just expressed as `disabled`: `canPromote` is
          // Boolean(rows), so promote stays impossible unless BOTH bodies
          // parsed and the side-by-side actually rendered. It is also false
          // when there is no draft at all.
          disabled={!canPromote}
          describedBy={!hasDraft ? NO_DRAFT_NOTE_ID : !canPromote ? PROMOTE_BLOCKED_ID : undefined}
          testId="promote-result"
        />
        {hasDraft && !canPromote ? (
          <p id={PROMOTE_BLOCKED_ID} className={styles.err} data-testid="promote-blocked">
            Promote is disabled: the draft did not parse, or the live body did not, so no
            side-by-side comparison could be rendered.
          </p>
        ) : null}
        <DiscardForm
          id={row.id}
          disabled={!hasDraft}
          describedBy={!hasDraft ? NO_DRAFT_NOTE_ID : undefined}
        />
      </section>

      {!hasDraft ? (
        <p className={styles.empty} data-testid="no-draft">
          No draft is pending for this lesson.
        </p>
      ) : (
        <div className={styles.columns} data-testid="diff">
          <div>
            <h2>Live</h2>
            {live.error ? (
              <p className={styles.err}>{live.error}</p>
            ) : !rows && live.blocks ? (
              <BlockRenderer blocks={live.blocks} lessonId={row.id} figures={figures} />
            ) : null}
          </div>
          <div>
            <h2>Draft</h2>
            {draft?.error ? (
              <p className={styles.err}>{draft.error}</p>
            ) : !rows && draft?.blocks ? (
              <BlockRenderer blocks={draft.blocks} lessonId={row.id} figures={figures} />
            ) : null}
          </div>

          {rows?.map((r, i) => (
            <div key={i} className={styles.pair} data-tag={r.tag}>
              <div className={`${styles.cell} ${styles[r.tag]}`}>
                <span className={styles.tag}>live · {r.tag}</span>
                {r.live ? <BlockRenderer blocks={[r.live]} lessonId={row.id} figures={figures} /> : null}
              </div>
              <div className={`${styles.cell} ${styles[r.tag]}`}>
                <span className={styles.tag}>draft · {r.tag}</span>
                {r.draft ? <BlockRenderer blocks={[r.draft]} lessonId={row.id} figures={figures} /> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasDraft && live.blocks ? (
        <BlockRenderer blocks={live.blocks} lessonId={row.id} figures={figures} />
      ) : null}
      {!hasDraft && live.error ? <p className={styles.err}>{live.error}</p> : null}
    </div>
  );
}
