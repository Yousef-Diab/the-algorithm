/**
 * Stands in for lib/auth.ts, whose import of @neondatabase/auth/next/server
 * pulls in next/headers and cannot load outside a Next request. The integration
 * suite exercises the DATABASE half of lib/db/access-queries.ts — entitlement
 * grants and reads — and passes user ids in directly, so it never needs a
 * session. Only accessContext() reaches for one, and nothing here calls it.
 *
 * Same reasoning as the server-only stub beside this file: alias the Next-only
 * module rather than letting a database test drag a request context in.
 */
export async function getCurrentUser(): Promise<{ id: string; email?: string } | null> {
  throw new Error("getCurrentUser is not available in the integration suite — pass a user id in");
}

export async function requireUserId(): Promise<string> {
  throw new Error("requireUserId is not available in the integration suite — pass a user id in");
}
