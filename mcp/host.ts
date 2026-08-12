import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { createWriter } from "../lib/content/write.ts";
import { createAdminQueries } from "../lib/content/admin-queries.ts";

const base = process.env.REVALIDATE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.REVALIDATE_SECRET;

async function purge(tag: string): Promise<Response> {
  return fetch(`${base}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
    headers: { "x-revalidate-secret": secret ?? "" },
  });
}

/**
 * PREFLIGHT BEFORE ANY WRITE, exactly as scripts/set-access.mjs does. Checking
 * only after the write commits leaves a stale readable copy in the public ISR
 * cache with no way back short of a manual purge — the invariant-2 failure this
 * exists to prevent.
 */
export async function preflight(): Promise<void> {
  if (!secret) throw new Error("REVALIDATE_SECRET is not set — refusing to write; the ISR cache could not be purged.");
  let res: Response;
  try {
    res = await purge("catalog");
  } catch (err) {
    throw new Error(`could not reach the revalidate endpoint at ${base} — refusing to write: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!res.ok) throw new Error(`revalidate endpoint at ${base} rejected the request (status ${res.status}) — refusing to write.`);
}

export function createHost() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set — see .env.local");
  const db = drizzle(neon(process.env.DATABASE_URL));
  const revalidate = async (tags: string[]) => {
    const failed: string[] = [];
    for (const t of tags) {
      try { if (!(await purge(t)).ok) failed.push(t); } catch { failed.push(t); }
    }
    if (failed.length) throw new Error(`FAILED to purge ${failed.join(", ")} after the write committed — the public cache is stale.`);
  };
  return { db, revalidate, writer: createWriter({ db, revalidate }), admin: createAdminQueries({ db }) };
}
