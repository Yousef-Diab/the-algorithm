import { and, eq, isNull, or, gt } from "drizzle-orm";
import { db } from "./index";
import { entitlements, userRoles, type EntitlementRow } from "./schema";
import { getCurrentUser } from "@/lib/auth";

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

/** The per-request access context every gate call needs. */
export async function accessContext() {
  const user = await getCurrentUser();
  if (!user) return { user: null, isAdmin: false, entitlements: [] as EntitlementRow[] };
  await ensureAdminRole(user);
  const [admin, ents] = await Promise.all([isAdminUser(user.id), entitlementsFor(user.id)]);
  return { user, isAdmin: admin, entitlements: ents };
}
