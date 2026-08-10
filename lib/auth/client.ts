"use client";
import { createAuthClient } from "@neondatabase/auth/next";

/** Better Auth client (signIn/signOut/useSession). Configured via the
 *  /api/auth proxy route on the same origin. */
export const authClient = createAuthClient();
