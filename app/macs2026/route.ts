import { grantDocsAccess } from "@/lib/docs-access";

// Legacy magic path: visiting /macs2026 unlocks the docs and goes to the overview.
// Redirect with a relative Location: behind the reverse proxy request.url points at
// localhost:3000, so an absolute URL built from it would leave the docs.macs.mn origin.
export async function GET() {
  await grantDocsAccess();
  return new Response(null, { status: 307, headers: { Location: "/overview" } });
}
