import { NextResponse } from "next/server";
import { mediaWithLesson } from "@/lib/content/queries";
import { getObject, presign } from "@/lib/media";
import { canRead } from "@/lib/access";
import { accessContext } from "@/lib/db/access-queries";

/** A UUID, so a malformed id 404s before touching the database. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * These two MUST stay desynchronised in one direction only: the redirect's
 * max-age has to be comfortably shorter than the presign TTL. Otherwise a
 * browser can replay a cached 302 whose signature has already expired (a
 * revisit between max-age and the TTL would follow a dead signature and the
 * chart 403s). Keeping max-age at half the TTL leaves a wide margin.
 */
const PRESIGN_TTL_SECONDS = 60;
const REDIRECT_CACHE_MAX_AGE_SECONDS = 30;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new NextResponse(null, { status: 404 });

  const row = await mediaWithLesson(id);
  // 404, never 403 — a 403 confirms the asset exists.
  if (!row) return new NextResponse(null, { status: 404 });

  const isPublic = row.access === "free" && row.status === "published";
  const ctx = isPublic ? { user: null, isAdmin: false, entitlements: [] } : await accessContext();
  if (!canRead(row, ctx)) return new NextResponse(null, { status: 404 });

  const isFree = row.access === "free";

  if (isFree) {
    // Public and immutable by id: the CDN caches it and R2 is hit once.
    const obj = await getObject(row.key);
    return new NextResponse(obj.body, {
      headers: {
        "content-type": obj.mime,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Gated: hand out a short-lived presigned URL instead of proxying bytes.
  const url = await presign(row.key, PRESIGN_TTL_SECONDS);
  return NextResponse.redirect(url, {
    status: 302,
    headers: { "cache-control": `private, max-age=${REDIRECT_CACHE_MAX_AGE_SECONDS}` },
  });
}
