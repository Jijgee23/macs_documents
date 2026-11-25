import { NextResponse } from "next/server";
import { hasDocsAccess } from "@/lib/docs-access";
import type { NextRequest } from "next/server";
import { searchSections } from "@/lib/content";

export async function GET(request: NextRequest) {
  if (!(await hasDocsAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchSections(q);
  return NextResponse.json({ results: results.slice(0, 8) });
}
