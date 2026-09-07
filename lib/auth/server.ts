import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * True once Neon Auth is configured. Until then the app runs local-only:
 * lessons public, progress/quiz in localStorage, notes unavailable.
 */
export const isAuthConfigured =
  Boolean(process.env.NEON_AUTH_BASE_URL) &&
  Boolean(process.env.NEON_AUTH_COOKIE_SECRET);

export const auth = isAuthConfigured
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
    })
  : null;
