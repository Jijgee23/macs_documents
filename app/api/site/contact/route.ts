import { NextResponse, after } from "next/server";
import { createContact, isAuthorizedSite } from "@/lib/inquiries";
import { notifyNewContact } from "@/lib/mail";

/** Server-to-server endpoint for macs.mn's contact form. See lib/inquiries.ts. */
export async function POST(request: Request) {
  if (!isAuthorizedSite(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { result, record } = await createContact(body);

  if (!result.ok) {
    const { status, ...rest } = result;
    return NextResponse.json(rest, { status });
  }

  after(() => notifyNewContact(record!));
  return NextResponse.json({ ok: true });
}
