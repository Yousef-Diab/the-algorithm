// Connectivity check for Neon Postgres. Confirms the app can reach the
// database and reports table counts per schema — never prints the
// connection string or credentials.
//
// dotenv/config only reads .env, not .env.local, so run this with:
//   node --env-file=.env.local scripts/db-ping.mjs
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = neon(url);
const [{ db, ver }] = await sql`select current_database() as db, version() as ver`;
const tables = await sql`
  select table_schema, count(*)::int as n
  from information_schema.tables
  where table_schema in ('public', 'neon_auth', 'drizzle')
  group by table_schema order by table_schema`;

console.log(`connected to ${db} — ${ver.split(" ").slice(0, 2).join(" ")}`);
for (const t of tables) console.log(`  ${t.table_schema}: ${t.n} table(s)`);
