import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Fast UX-level redirect only — NOT the real auth check. Every admin Server
 * Action / Route Handler must independently call requireAdmin() (see lib/auth.ts),
 * per Next.js's DAL guidance: proxy alone is not sufficient defense.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Visiting /macs2026 bypasses the docs site's password prompt (matches the
  // legacy SPA's magic-path unlock). PasswordGate reads ?unlock= client-side.
  if (/^\/macs2026\/?$/.test(pathname)) {
    const url = new URL("/overview", request.url);
    url.searchParams.set("unlock", "macs2026");
    return NextResponse.redirect(url);
  }

  const isLoginPage = pathname === "/admin/login";
  const hasSession = request.cookies.has("macs_docs_admin_session");

  if (pathname.startsWith("/admin") && !isLoginPage && !hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/macs2026", "/macs2026/"],
};
