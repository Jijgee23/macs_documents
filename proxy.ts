import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Fast UX-level redirect only — NOT the real auth check. Every admin Server
 * Action / Route Handler must independently call requireAdmin() (see lib/auth.ts),
 * per Next.js's DAL guidance: proxy alone is not sufficient defense.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const hasSession = request.cookies.has("macs_docs_admin_session");

  if (pathname.startsWith("/admin") && !isLoginPage && !hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
