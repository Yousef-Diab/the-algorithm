import { and, eq, isNotNull, sql } from "drizzle-orm";
import { lessons } from "../db/schema";
import { assertBlocks } from "./blocks";
import { assertMeta, assertSourceRef } from "./write-validate";

/**
 * THE db HANDLE IS INJECTED, and this module imports NEITHER `@/lib/db` NOR
 * any `next/*`. `lib/db/index.ts:1` is `import "server-only"` — a package that
 * is NOT installed; Next aliases it at build time and vitest.config.ts:21
 * aliases it to a stub. A plain Node process (mcp/server.ts, scripts/*.mjs)
 * that reaches lib/db dies with ERR_MODULE_NOT_FOUND, and nothing in lint,
 * tsc, pnpm build or the unit suite would tell you. Same invisible-failure
 * class as the "use server" type-export trap. Do not "simplify" this away.
 *
 * Imports in this file are RELATIVE, not `@/`, for the same reason: this
 * module is loaded by a plain Node process (the MCP server, the CLIs) in
 * addition to Next and Vitest, and only Next/Vitest resolve the `@/` alias.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDb = any;

export interface WriterDeps {
  db: AnyDb;
  revalidate: (tags: string[]) => Promise<void> | void;
  repoRoot?: string;
}

/** Invariant 2′: EVERY write purges all three, uniformly. */
export function tagsFor(id: string): string[] {
  return [`lesson:${id}`, `lesson-meta:${id}`, "catalog"];
}

export function createWriter({ db, revalidate, repoRoot = process.cwd() }: WriterDeps) {
  async function writeLessonBody(id: string, blocks: unknown, sourceRef: string): Promise<void> {
    const ref = assertSourceRef(sourceRef, repoRoot);
    const body = assertBlocks(blocks);
    await db
      .update(lessons)
      .set({ bodyDraft: body, sourceRefDraft: ref, writeOrigin: "cms", updatedAt: new Date() })
      .where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  async function writeLessonMeta(id: string, patch: unknown): Promise<void> {
    const meta = assertMeta(patch);
    if (Object.keys(meta).length === 0) return;
    await db.update(lessons).set({ ...meta, updatedAt: new Date() }).where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  /**
   * ONE statement, so it is atomic without a transaction (neon-http has no
   * interactive ones). `WHERE body_draft IS NOT NULL` + RETURNING is what makes
   * "there was no draft" reportable instead of a silent no-op success.
   * The cache purge is still a separate round trip — see the spec §4.4.
   */
  async function promoteDraft(id: string): Promise<boolean> {
    const rows = await db
      .update(lessons)
      .set({
        body: sql`${lessons.bodyDraft}`,
        sourceRef: sql`${lessons.sourceRefDraft}`,
        bodyDraft: null,
        sourceRefDraft: null,
        writeOrigin: "cms",
        updatedAt: new Date(),
      })
      .where(and(eq(lessons.id, id), isNotNull(lessons.bodyDraft)))
      .returning({ id: lessons.id });
    if (rows.length === 0) return false;
    await revalidate(tagsFor(id));
    return true;
  }

  async function discardDraft(id: string): Promise<boolean> {
    const rows = await db
      .update(lessons)
      .set({ bodyDraft: null, sourceRefDraft: null, updatedAt: new Date() })
      .where(and(eq(lessons.id, id), isNotNull(lessons.bodyDraft)))
      .returning({ id: lessons.id });
    if (rows.length === 0) return false;
    await revalidate(tagsFor(id));
    return true;
  }

  async function setStatus(id: string, status: "draft" | "published"): Promise<void> {
    await db
      .update(lessons)
      .set({ status, publishedAt: status === "published" ? new Date() : null, updatedAt: new Date() })
      .where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  async function setAccess(id: string, access: "free" | "members" | "admin"): Promise<void> {
    await db.update(lessons).set({ access, updatedAt: new Date() }).where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  return { writeLessonBody, writeLessonMeta, promoteDraft, discardDraft, setStatus, setAccess };
}
