// scripts/set-access.mjs
// Usage: node --env-file=.env.local --experimental-strip-types scripts/set-access.mjs <free|members|admin> <lessonId…>
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { inArray } from "drizzle-orm";
import { lessons } from "../lib/db/schema.ts";

const [access, ...ids] = process.argv.slice(2);
if (!["free", "members", "admin"].includes(access) || ids.length === 0) {
  console.error("usage: set-access.mjs <free|members|admin> <lessonId…>");
  process.exit(1);
}

const base = process.env.REVALIDATE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.REVALIDATE_SECRET;

async function revalidate(tag) {
  return fetch(`${base}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
    headers: { "x-revalidate-secret": secret },
  });
}

/**
 * DEVIATION from the original spec: both checks below run BEFORE the UPDATE,
 * not after. Checking (or discovering an unreachable endpoint) only after the
 * write commits leaves a stale copy in the public ISR cache with no way back
 * short of a manual purge — precisely the invariant-2 failure this script
 * exists to prevent. So a missing secret or an unreachable/misconfigured
 * revalidate endpoint aborts here, and the database is never touched.
 */
if (!secret) {
  console.error(
    "REVALIDATE_SECRET is not set — refusing to write: the ISR cache could not be purged afterwards. Set it and re-run.",
  );
  process.exit(1);
}

let preflight;
try {
  preflight = await revalidate("catalog");
} catch (err) {
  console.error(
    `could not reach the revalidate endpoint at ${base} — refusing to write: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
}
if (!preflight.ok) {
  console.error(
    `revalidate endpoint at ${base} rejected the request (status ${preflight.status}) — check REVALIDATE_SECRET and REVALIDATE_BASE_URL. Refusing to write.`,
  );
  process.exit(1);
}

const db = drizzle(neon(process.env.DATABASE_URL));
const rows = await db
  .update(lessons)
  .set({ access, updatedAt: new Date() })
  .where(inArray(lessons.id, ids))
  .returning({ id: lessons.id, access: lessons.access });
console.log("updated:", rows.map((r) => `${r.id}=${r.access}`).join(" "));

// Invariant 2: purge the public cache in the same breath as the write. The
// preflight above only narrows the window between it and this write — it
// cannot close it, since the write is a separate round-trip in between — so
// every one of these calls is checked too: attempt them ALL (the write has
// already committed, so purging as many tags as possible beats stopping
// early), then exit non-zero if any of them failed, naming the un-purged tag.
let failed = false;
async function purge(tag) {
  try {
    const res = await revalidate(tag);
    if (!res.ok) {
      console.error(`FAILED to purge ${tag} (status ${res.status}) — the public cache for this tag is stale. Retry with: node --env-file=.env.local --experimental-strip-types scripts/set-access.mjs ${access} ${ids.join(" ")}`);
      failed = true;
      return;
    }
    console.log(`revalidate ${tag} → ${res.status}`);
  } catch (err) {
    console.error(`FAILED to purge ${tag} — could not reach ${base}: ${err instanceof Error ? err.message : String(err)}. The public cache for this tag is stale. Retry with: node --env-file=.env.local --experimental-strip-types scripts/set-access.mjs ${access} ${ids.join(" ")}`);
    failed = true;
  }
}
// Invariant 2 requires lesson:{id}, lesson-meta:{id} AND catalog to be purged
// by any write that changes lessons.access. lesson-meta:{id} is purged
// explicitly here rather than relying on getLessonMeta's incidental dual
// tagging (it currently also carries the lesson:{id} tag) — that coupling is
// an implementation detail of lib/content/queries.ts, not a contract, and
// narrowing it later must not silently break this script.
for (const id of ids) {
  await purge(`lesson:${id}`);
  await purge(`lesson-meta:${id}`);
}
await purge("catalog");

if (failed) {
  console.error("one or more revalidation calls failed after the write committed — see FAILED lines above.");
  // exitCode, not exit(1): the neon-http driver's fetch keep-alive socket is
  // still open at this point, and forcing an immediate process.exit() while
  // it's open crashes Node on Windows (libuv assertion). Setting exitCode
  // lets the event loop drain first and still exits non-zero.
  process.exitCode = 1;
}
