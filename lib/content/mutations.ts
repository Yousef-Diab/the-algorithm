"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { assertBlocks } from "./blocks";
import { accessContext } from "@/lib/db/access-queries";

async function requireAdmin(): Promise<void> {
  const ctx = await accessContext();
  if (!ctx.isAdmin) throw new Error("admin only");
}

/**
 * Every path that changes what a cached page would show revalidates here, in
 * the same function as the write. Invariant 2: a free → members flip otherwise
 * leaves a readable copy in the PUBLIC ISR cache until the next revalidation.
 */
function revalidateLesson(id: string): void {
  revalidateTag(`lesson:${id}`);
  revalidateTag(`lesson-meta:${id}`);
  revalidateTag("catalog");
}

export async function setLessonAccess(id: string, access: "free" | "members" | "admin"): Promise<void> {
  await requireAdmin();
  await db.update(lessons).set({ access, updatedAt: new Date() }).where(eq(lessons.id, id));
  revalidateLesson(id);
}

export async function publishLesson(id: string, status: "draft" | "published"): Promise<void> {
  await requireAdmin();
  await db
    .update(lessons)
    .set({ status, publishedAt: status === "published" ? new Date() : null, updatedAt: new Date() })
    .where(eq(lessons.id, id));
  revalidateLesson(id);
}

/**
 * INVARIANT 5: the body arrives as a JSON *string*. React Flight silently drops
 * a ProseMirror/Tiptap node's attrs (including an image src) across the
 * client→server boundary — text and marks survive, so it looks like it works.
 * This already cost a debugging session on the previous branch.
 */
export async function saveLessonBody(id: string, bodyJson: string): Promise<void> {
  await requireAdmin();
  const blocks = assertBlocks(JSON.parse(bodyJson));
  await db.update(lessons).set({ body: blocks, updatedAt: new Date() }).where(eq(lessons.id, id));
  revalidateLesson(id);
}
