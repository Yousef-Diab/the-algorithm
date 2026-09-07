// scripts/grant-entitlement.mjs
// Usage: node --env-file=.env.local --experimental-strip-types scripts/grant-entitlement.mjs <email>
//
// Grants a scope='all', source='admin_grant', expires_at=null entitlement to
// the account with the given email. Idempotent — running it twice for the
// same account makes no second row. READS neon_auth."user" to resolve the
// email to a user id, but never writes to that schema. Never prints the
// email it was given.
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql, and, eq, isNull } from "drizzle-orm";
import { entitlements } from "../lib/db/schema.ts";

const [email] = process.argv.slice(2);
if (!email) {
  console.error("usage: grant-entitlement.mjs <email>");
  process.exit(1);
}

const db = drizzle(neon(process.env.DATABASE_URL));

// READ ONLY against neon_auth."user" — never write to that schema.
const result = await db.execute(sql`select id from neon_auth."user" where email = ${email} limit 1`);
const rows = Array.isArray(result) ? result : (result.rows ?? []);
const user = rows[0];
if (!user) {
  console.error("no matching account found for the given email");
  process.exit(1);
}
const userId = user.id;

const existing = await db
  .select({ id: entitlements.id })
  .from(entitlements)
  .where(
    and(
      eq(entitlements.userId, userId),
      eq(entitlements.source, "admin_grant"),
      eq(entitlements.scope, "all"),
      isNull(entitlements.expiresAt),
    ),
  )
  .limit(1);

if (existing.length > 0) {
  console.log("entitlement already present — no changes made");
  process.exit(0);
}

await db.insert(entitlements).values({ userId, source: "admin_grant", scope: "all", expiresAt: null });
console.log("entitlement granted");
