"use client";
import { createAuthClient } from "@neondatabase/auth/next";
import { needsEmailVerification, rememberPending } from "./pending-verification";

/** Better Auth client (signIn/signOut/useSession). Configured via the
 *  /api/auth proxy route on the same origin. */
const baseClient = createAuthClient();

/**
 * Wraps `signUp.email` so a sign-up that leaves the address unverified records
 * it before the auth UI navigates away.
 *
 * This is the only point where the address is still in hand: the UI library's
 * sign-up handler holds it, sends the user to /auth/sign-in, and forgets it —
 * and because Neon Auth issues a 6-digit code rather than a link (see
 * ./pending-verification), the user would otherwise have nowhere to enter it.
 * A Proxy rather than a rebuilt client so every other method, hook and internal
 * of the Better Auth client reaches the UI untouched.
 *
 * Note the `canProxy` check rather than a plain `typeof === "object"`: Better
 * Auth builds its client from dynamic path proxies whose target is `function
 * () {}`, so `client.signUp` is a FUNCTION. Testing for an object silently
 * skipped the wrap and the whole detour never fired.
 */
const canProxy = (value: unknown): value is object =>
  (typeof value === "object" && value !== null) || typeof value === "function";

function withPendingVerification<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, prop) {
      const value = Reflect.get(target, prop);
      if (prop !== "signUp" || !canProxy(value)) return value;
      return new Proxy(value, {
        get(signUp, method) {
          const original = Reflect.get(signUp, method);
          if (method !== "email" || typeof original !== "function") return original;
          return async (...args: unknown[]) => {
            const result = await (original as (...a: unknown[]) => Promise<unknown>)(...args);
            const email = (args[0] as { email?: unknown } | undefined)?.email;
            if (typeof email === "string" && email !== "" && needsEmailVerification(result)) {
              rememberPending(email);
            }
            return result;
          };
        },
      });
    },
  });
}

export const authClient = withPendingVerification(baseClient);
