import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchSections } from "@/lib/content";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchSections(q);
  return NextResponse.json({ results: results.slice(0, 8) });
}
