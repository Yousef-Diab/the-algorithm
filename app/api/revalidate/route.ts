import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Constant-time compare so a wrong secret can't be brute-forced by timing the
 * response. `timingSafeEqual` throws on a length mismatch instead of returning
 * false, so that case is checked first.
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * 404 (never 401/403) on every failure path — including an unset server-side
 * secret — so the endpoint's existence is never confirmed and a misconfigured
 * deploy can never become an open purge endpoint.
 */
export async function GET(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return new NextResponse(null, { status: 404 });

  const provided = req.headers.get("x-revalidate-secret");
  if (!provided || !secretMatches(provided, expected)) {
    return new NextResponse(null, { status: 404 });
  }

  const tag = new URL(req.url).searchParams.get("tag");
  if (!tag) return new NextResponse(null, { status: 404 });

  // { expire: 0 }, not a named profile like "max": traced into Next's
  // file-system cache handler, an object profile sets the tag's `expired`
  // timestamp to `now + expire*1000`, so `expire: 0` resolves to `now` — an
  // immediate purge. A named profile would look up a configured, non-zero
  // duration instead and would NOT purge immediately. `updateTag(tag)` is not
  // an option here: it throws outside a Server Action, and this is a Route
  // Handler — see lib/content/mutations.ts for the fuller trace.
  revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: true, tag });
}
