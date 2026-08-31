import { notFound } from "next/navigation";
import Link from "next/link";
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
import { ActionButton } from "@/components/admin/ActionButton";
import { DiscardForm } from "@/components/admin/DiscardForm";
import { promoteAction, setStatusAction, setAccessAction } from "@/app/admin/actions";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

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

  return (
    <div className={styles.console}>
      <p>
        <Link href="/admin">← all lessons</Link>
      </p>
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

      <section className={styles.actions}>
        <ActionButton action={setStatusAction} label="Publish" hidden={{ id: row.id, status: "published" }} />
        <ActionButton action={setStatusAction} label="Unpublish" hidden={{ id: row.id, status: "draft" }} />
        <ActionButton action={setAccessAction} label="Access: free" hidden={{ id: row.id, access: "free" }} />
        <ActionButton action={setAccessAction} label="Access: members" hidden={{ id: row.id, access: "members" }} />
        <ActionButton action={setAccessAction} label="Access: admin" hidden={{ id: row.id, access: "admin" }} />
      </section>

      {!hasDraft ? (
        <p className={styles.empty} data-testid="no-draft">
          No draft is pending for this lesson.
        </p>
      ) : (
        <>
          <section className={styles.actions}>
            {draft?.blocks ? (
              <ActionButton
                action={promoteAction}
                label="Promote draft"
                hidden={{ id: row.id, fingerprint: fingerprint(draft.blocks) }}
              />
            ) : (
              <p className={styles.err} data-testid="promote-blocked">
                Promote is disabled: the draft does not parse, so this page could not render it.
              </p>
            )}
            <DiscardForm id={row.id} />
          </section>

          <div className={styles.columns} data-testid="diff">
            <div>
              <h2>Live</h2>
              {live.error ? <p className={styles.err}>{live.error}</p> : null}
            </div>
            <div>
              <h2>Draft</h2>
              {draft?.error ? <p className={styles.err}>{draft.error}</p> : null}
            </div>

            {rows?.map((r, i) => (
              <div key={i} className={styles.pair} data-tag={r.tag}>
                <div className={`${styles.cell} ${styles[r.tag]}`}>
                  <span className={styles.tag}>{r.tag}</span>
                  {r.live ? <BlockRenderer blocks={[r.live]} lessonId={row.id} figures={figures} /> : null}
                </div>
                <div className={`${styles.cell} ${styles[r.tag]}`}>
                  <span className={styles.tag}>{r.tag}</span>
                  {r.draft ? <BlockRenderer blocks={[r.draft]} lessonId={row.id} figures={figures} /> : null}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasDraft && live.blocks ? (
        <BlockRenderer blocks={live.blocks} lessonId={row.id} figures={figures} />
      ) : null}
      {!hasDraft && live.error ? <p className={styles.err}>{live.error}</p> : null}
    </div>
  );
}
