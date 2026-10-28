import { db } from "@/lib/db";
import { topicLabel } from "@/lib/inquiries";
import { ContactLinks, InquiryCard, parseStatus, StatusFilter } from "@/components/admin/InquiryList";
import { mutedStyle } from "@/components/admin/styles";

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const filter = parseStatus((await searchParams).status);

  const [messages, counts] = await Promise.all([
    db.contactMessage.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.contactMessage.groupBy({ by: ["status"], _count: true }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Санал хүсэлтүүд</h1>
      <p className="mb-5 text-[13px]" style={mutedStyle}>
        macs.mn/holboo-barih формоос ирсэн мессежүүд.
      </p>
      <StatusFilter basePath="/admin/messages" filter={filter} counts={counts} />

      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm" style={mutedStyle}>
          Мессеж алга.
        </p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {messages.map((m) => (
            <InquiryCard key={m.id} kind="contact" item={m} title={m.name ?? m.email} subtitle={topicLabel(m.topic)}>
              <ContactLinks email={m.email} phone={m.phone} />
              <p className="mt-2 text-sm whitespace-pre-line">{m.message}</p>
            </InquiryCard>
          ))}
        </ul>
      )}
    </div>
  );
}
