import { notFound } from "next/navigation";
import { accessContext } from "@/lib/db/access-queries";

/**
 * The ONE definition of the admin check. Pages call requireAdminPage(),
 * Server Actions call assertAdmin(), and lib/content/mutations.ts delegates
 * to assertAdmin() rather than keeping a second copy.
 *
 * This module is deliberately NOT "use server". Everything exported from a
 * "use server" module becomes a callable action endpoint, and a guard that
 * anyone can invoke over the network is not a guard.
 *
 * Gating is on HUMAN IDENTITY only — the auth session plus the ADMIN_EMAILS
 * allowlist, via accessContext(). Never on a bearer secret or a token in
 * .env.local: the AI agent reads that file routinely, and a secret there would
 * hand it the exact publish capability that CMS invariant 10 removes.
 */
export async function assertAdmin(): Promise<void> {
  const ctx = await accessContext();
  if (!ctx.isAdmin) throw new Error("admin only");
}

/**
 * 404, never 403 — the project-wide rule. An anonymous visitor and a
 * signed-in non-admin member are indistinguishable from someone requesting a
 * route that does not exist. A redirect to sign-in would confirm it does.
 *
 * Call this as the FIRST statement of every admin page body, before any query.
 * There is deliberately no admin layout performing this check: a layout gate
 * lets a future page inherit a check it never called.
 */
export async function requireAdminPage() {
  const ctx = await accessContext();
  if (!ctx.isAdmin) notFound();
  return ctx;
}
