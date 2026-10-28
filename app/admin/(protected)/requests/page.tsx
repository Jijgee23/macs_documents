import { db } from "@/lib/db";
import { productLabel } from "@/lib/inquiries";
import { ContactLinks, InquiryCard, parseStatus, StatusFilter } from "@/components/admin/InquiryList";
import { mutedStyle } from "@/components/admin/styles";

export default async function QuoteRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const filter = parseStatus((await searchParams).status);

  const [quotes, counts] = await Promise.all([
    db.quoteRequest.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.quoteRequest.groupBy({ by: ["status"], _count: true }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Үнийн саналын хүсэлтүүд</h1>
      <p className="mb-5 text-[13px]" style={mutedStyle}>
        macs.mn/une-sanal формоос ирсэн хүсэлтүүд.
      </p>
      <StatusFilter basePath="/admin/requests" filter={filter} counts={counts} />

      {quotes.length === 0 ? (
        <p className="py-10 text-center text-sm" style={mutedStyle}>
          Хүсэлт алга.
        </p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {quotes.map((q) => (
            <InquiryCard
              key={q.id}
              kind="quote"
              item={q}
              title={q.company ?? q.name ?? q.email}
              subtitle={q.company ? q.name : null}
            >
              <ContactLinks email={q.email} phone={q.phone} />
              {q.products.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {q.products.map((p) => (
                    <li key={p} className="rounded px-2 py-0.5 text-xs" style={{ background: "var(--hv)" }}>
                      {productLabel(p)}
                    </li>
                  ))}
                </ul>
              )}
              {q.message && <p className="mt-2 text-sm whitespace-pre-line">{q.message}</p>}
            </InquiryCard>
          ))}
        </ul>
      )}
    </div>
  );
}
