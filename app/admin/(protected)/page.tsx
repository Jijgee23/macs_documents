import Link from "next/link";
import { db } from "@/lib/db";
import { deleteSectionAction } from "@/lib/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { cardStyle, linkStyle, mutedStyle, primaryButtonStyle } from "@/components/admin/styles";

export default async function AdminDashboardPage() {
  const modules = await db.module.findMany({
    orderBy: { order: "asc" },
    include: {
      sections: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: { children: { orderBy: { order: "asc" } } },
      },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Хэсгүүд</h1>
        <Link href="/admin/sections/new" className="px-4 py-2 text-sm font-medium" style={primaryButtonStyle}>
          + Шинэ хэсэг
        </Link>
      </div>
      <div className="space-y-8">
        {modules.map((m) => (
          <section key={m.id}>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase" style={mutedStyle}>
              {m.title}
            </h2>
            <ul style={cardStyle}>
              {m.sections.map((s, idx) => (
                <li key={s.id} style={{ borderTop: idx > 0 ? "1px solid var(--br)" : undefined }}>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <Link href={`/${s.id}`} target="_blank" className="font-medium hover:underline">
                        {s.title}
                      </Link>
                      <span className="ml-2 text-xs" style={mutedStyle}>
                        {s.id}
                      </span>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <Link href={`/admin/sections/${s.id}/edit`} className="hover:underline" style={linkStyle}>
                        Засах
                      </Link>
                      <form action={deleteSectionAction.bind(null, s.id)}>
                        <ConfirmButton message={`"${s.title}" хэсгийг устгах уу?`} className="hover:underline" style={linkStyle}>
                          Устгах
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                  {s.children.length > 0 && (
                    <ul style={{ borderTop: "1px solid var(--br)", background: "var(--hv)" }}>
                      {s.children.map((c) => (
                        <li key={c.id} className="flex items-center justify-between px-8 py-2">
                          <div>
                            <Link href={`/${c.id}`} target="_blank" className="hover:underline">
                              {c.title}
                            </Link>
                            <span className="ml-2 text-xs" style={mutedStyle}>
                              {c.id}
                            </span>
                          </div>
                          <div className="flex gap-3 text-sm">
                            <Link
                              href={`/admin/sections/${c.id}/edit`}
                              className="hover:underline"
                              style={linkStyle}
                            >
                              Засах
                            </Link>
                            <form action={deleteSectionAction.bind(null, c.id)}>
                              <ConfirmButton
                                message={`"${c.title}" хэсгийг устгах уу?`}
                                className="hover:underline"
                                style={linkStyle}
                              >
                                Устгах
                              </ConfirmButton>
                            </form>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
