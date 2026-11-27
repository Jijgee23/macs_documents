import type { NextRequest } from "next/server";
import { checkDocsPassword, grantDocsAccess } from "@/lib/docs-access";

// Legacy "?unlock=<password>" links. proxy.ts redirects here; we verify the password
// server-side, set the access cookie, and send the visitor back without the parameter.
export async function GET(request: NextRequest) {
  // nextUrl (not request.url) reflects the proxy.ts rewrite that carries key/to.
  const params = request.nextUrl.searchParams;
  const key = params.get("key") ?? "";
  const to = params.get("to") ?? "/";
  // Only same-origin paths; never an open redirect.
  const target = to.startsWith("/") && !to.startsWith("//") && !to.startsWith("/\\") ? to : "/";

  if (key && checkDocsPassword(key)) await grantDocsAccess();

  // Relative Location: behind the reverse proxy request.url points at localhost.
  return new Response(null, { status: 307, headers: { Location: target } });
}
