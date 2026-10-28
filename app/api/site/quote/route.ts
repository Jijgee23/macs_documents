import { NextResponse, after } from "next/server";
import { createQuote, isAuthorizedSite } from "@/lib/inquiries";
import { notifyNewQuote } from "@/lib/mail";

/** Server-to-server endpoint for macs.mn's quote form. See lib/inquiries.ts. */
export async function POST(request: Request) {
  if (!isAuthorizedSite(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { result, record } = await createQuote(body);

  if (!result.ok) {
    const { status, ...rest } = result;
    return NextResponse.json(rest, { status });
  }

  after(() => notifyNewQuote(record!));
  return NextResponse.json({ ok: true });
}
