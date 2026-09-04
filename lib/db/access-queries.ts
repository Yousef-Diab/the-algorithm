import { and, eq, isNull, or, gt, sql } from "drizzle-orm";
import { db } from "./index";
import { entitlements, userRoles, type EntitlementRow } from "./schema";
import { getCurrentUser } from "@/lib/auth";
import { needsMembershipGrant } from "@/lib/access";

export async function isAdminUser(userId: string): Promise<boolean> {
  const [row] = await db.select().from(userRoles).where(eq(userRoles.userId, userId)).limit(1);
  return Boolean(row);
}

/** Unexpired entitlements only — expiry is enforced in SQL, not in the caller. */
export async function entitlementsFor(userId: string): Promise<EntitlementRow[]> {
  return db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        or(isNull(entitlements.expiresAt), gt(entitlements.expiresAt, new Date())),
      ),
    );
}

/**
 * Bootstraps an admin row from the ADMIN_EMAILS allowlist. Called on every
 * authenticated request that needs a role, so a newly-listed email is promoted
 * on their next visit with no manual SQL.
 */
export async function ensureAdminRole(user: { id: string; email?: string | null }): Promise<void> {
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!user.email || !allow.includes(user.email.toLowerCase())) return;
  await db.insert(userRoles).values({ userId: user.id, role: "admin" }).onConflictDoNothing();
}

/**
 * Grants the free signup entitlement the first time a signed-up account asks
 * for content, so "I made an account" and "I am a member" are the same thing
 * while membership is free. Idempotent via the partial unique index on
 * (user_id) WHERE source = 'signup' — two concurrent first requests leave one
 * row, not two.
 *
 * Returns the rows the caller should gate on: the inserted row when it created
 * one, otherwise the rows it was handed. A failed insert is NOT swallowed — a
 * member who cannot be granted must see the locked state, never a page that
 * silently disagrees with the database.
 */
export async function ensureMembership(
  userId: string,
  existing: EntitlementRow[],
): Promise<EntitlementRow[]> {
  if (!needsMembershipGrant({ user: { id: userId }, isAdmin: false, entitlements: existing })) {
    return existing;
  }
  const inserted = await db
    .insert(entitlements)
    .values({ userId, source: "signup", scope: "all" })
    .onConflictDoNothing({ target: entitlements.userId, where: sql`source = 'signup'` })
    .returning();
  // Empty means the index caught a concurrent grant: the row exists either way,
  // so re-read rather than reporting an entitlement set that omits it.
  return inserted.length > 0 ? [...existing, ...inserted] : entitlementsFor(userId);
}

/** The per-request access context every gate call needs. */
export async function accessContext() {
  const user = await getCurrentUser();
  if (!user) return { user: null, isAdmin: false, entitlements: [] as EntitlementRow[] };
  await ensureAdminRole(user);
  const [admin, ents] = await Promise.all([isAdminUser(user.id), entitlementsFor(user.id)]);
  return { user, isAdmin: admin, entitlements: await ensureMembership(user.id, ents) };
}
