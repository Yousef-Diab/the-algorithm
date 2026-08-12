"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { createWriter } from "./write";
import { accessContext } from "@/lib/db/access-queries";

async function requireAdmin(): Promise<void> {
  const ctx = await accessContext();
  if (!ctx.isAdmin) throw new Error("admin only");
}

/**
 * Every path that changes what a cached page would show revalidates here, in
 * the same function as the write. Invariant 2: a free → members flip otherwise
 * leaves a readable copy in the PUBLIC ISR cache until the next revalidation.
 *
 * `revalidateTag` now REQUIRES a second argument (Next 16). Passing `{ expire:
 * 0 }` — not a named profile like "max" — is what actually purges immediately:
 * traced into node_modules/next/dist/server/lib/incremental-cache/
 * file-system-cache.js `revalidateTag()`, an object profile sets
 * `updates.expired = now + durations.expire * 1000`, so `expire: 0` resolves
 * to `now` — the same immediate expiry as the pre-16 single-argument call,
 * just spelled as a real profile instead of an omitted one. A named profile
 * (e.g. "max") instead looks up a configured, non-zero `expire` duration and
 * would NOT purge immediately. This file could instead call the single-arg
 * `updateTag(tag)` (Server-Action-only, also resolves to an immediate purge
 * via the same code path when no profile is given) since every caller here is
 * a Server Action — but `revalidateTag(tag, { expire: 0 })` is used instead so
 * this helper's behavior is identical to the Route Handler's in
 * app/api/revalidate/route.ts, which cannot use `updateTag` at all (it throws
 * outside a Server Action) and must call `revalidateTag` regardless.
 */
const writer = createWriter({
  db,
  revalidate: (tags) => {
    for (const t of tags) revalidateTag(t, { expire: 0 });
  },
});

export async function setLessonAccess(id: string, access: "free" | "members" | "admin"): Promise<void> {
  await requireAdmin();
  await writer.setAccess(id, access);
}

export async function publishLesson(id: string, status: "draft" | "published"): Promise<void> {
  await requireAdmin();
  await writer.setStatus(id, status);
}

/**
 * INVARIANT 5: the body arrives as a JSON *string*. React Flight silently drops
 * a ProseMirror/Tiptap node's attrs (including an image src) across the
 * client→server boundary — text and marks survive, so it looks like it works.
 * The MCP tool deliberately takes a real array instead: MCP is JSON-RPC and has
 * no such flaw. Do not "align" the two.
 */
export async function saveLessonBody(id: string, bodyJson: string, sourceRef: string): Promise<void> {
  await requireAdmin();
  await writer.writeLessonBody(id, JSON.parse(bodyJson), sourceRef);
}

export async function promoteLessonDraft(id: string): Promise<boolean> {
  await requireAdmin();
  return writer.promoteDraft(id);
}
