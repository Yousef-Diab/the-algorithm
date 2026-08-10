import "server-only";
import { auth } from "@/lib/auth/server";

export interface CurrentUser {
  id: string;
  email?: string;
}

/** Current signed-in user, or null (also null when auth isn't configured).
 *  Narrowed to { id, email } so nothing downstream couples to the SDK's
 *  session-user shape. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!auth) return null;
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email };
}

/** Returns the user id or throws — use to guard write server actions. */
export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}
