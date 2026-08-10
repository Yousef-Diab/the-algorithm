import { NextResponse, type NextRequest } from "next/server";

/**
 * A members lesson is rendered per-request and must never enter a shared cache.
 * Next marks dynamic responses private already; this makes it explicit and
 * survives a future config change.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/lesson/")) {
    res.headers.set("Vary", "Cookie");
  }
  return res;
}

export const config = { matcher: ["/lesson/:path*"] };
