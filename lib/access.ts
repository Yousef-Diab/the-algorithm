/**
 * THE gate. Every body render and every media request passes through canRead —
 * that single choke point is what makes "nobody without access can see the
 * content" auditable rather than hopeful.
 *
 * Pure by design: no database, no auth SDK, no request. The caller assembles
 * AccessCtx once per request (see lib/db/access-queries.ts accessContext).
 */

export interface Gated {
  sectionId: string;
  /** 'free' | 'members' | 'admin' — anything else fails closed. */
  access: string;
  /** 'draft' | 'published' — anything else fails closed. */
  status: string;
}

export interface AccessCtx {
  user: { id: string } | null;
  isAdmin: boolean;
  /** Already filtered to unexpired rows by entitlementsFor(). */
  entitlements: { scope: string; sectionId: string | null }[];
}

export function hasEntitlement(ctx: AccessCtx, sectionId: string): boolean {
  if (!ctx.user) return false;
  return ctx.entitlements.some(
    (e) => e.scope === "all" || (e.scope === "section" && e.sectionId === sectionId),
  );
}

/**
 * Whether this user still needs the free signup grant.
 *
 * Membership is free today, so a signed-up account is a member — but that is
 * expressed as a real entitlement row rather than as "signed in means member"
 * inside canRead, so the day a subscription decides access, only the granting
 * changes and the gate does not. Pure so it can be tested without a database.
 */
export function needsMembershipGrant(ctx: AccessCtx): boolean {
  if (!ctx.user) return false;
  return !ctx.entitlements.some((e) => e.scope === "all");
}

export function canRead(lesson: Gated, ctx: AccessCtx): boolean {
  // Unpublished (or any unrecognised status) is admin-only.
  if (lesson.status !== "published") return ctx.isAdmin;

  switch (lesson.access) {
    case "free":
      return true;
    case "members":
      return ctx.isAdmin || hasEntitlement(ctx, lesson.sectionId);
    case "admin":
      return ctx.isAdmin;
    default:
      // Fail closed: an unknown access value locks content rather than leaking it.
      return false;
  }
}
