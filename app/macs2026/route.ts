import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { grantDocsAccess } from "@/lib/docs-access";

// Legacy magic path: visiting /macs2026 unlocks the docs and goes to the overview.
export async function GET(request: NextRequest) {
  await grantDocsAccess();
  return NextResponse.redirect(new URL("/overview", request.url));
}
