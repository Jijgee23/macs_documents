import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPrevNext, getSection } from "@/lib/content";
import { FavoriteButton } from "@/components/FavoriteButton";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [section, { prev, next }] = await Promise.all([getSection(id), getPrevNext(id)]);

  if (!section) notFound();

  return (
    <div className="mx-auto max-w-[800px] pb-[60px]">
      <div
        className="px-6 pt-[18px] pb-4 md:px-9"
        style={{ borderBottom: "1px solid var(--br)" }}
      >
        <p className="mb-1.5 text-[12px]" style={{ color: "var(--mu)" }}>
          {section.module.title}
          {section.parent ? ` / ${section.parent.title}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1
            className="text-[25px] leading-[1.32] font-bold"
            style={{ letterSpacing: "-0.015em", color: "var(--tx)" }}
          >
            {section.title}
          </h1>
          <span
            className="text-[11px] font-semibold"
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              background: "var(--badge)",
              border: "1px solid var(--badge-br)",
              color: "var(--badge-tx)",
            }}
          >
            {section.module.title}
          </span>
          <span className="no-print">
            <FavoriteButton id={section.id} title={section.title} />
          </span>
        </div>
      </div>

      <div className="px-6 py-7 md:px-9">
        {section.body ? (
          <div className="doc-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="table-wrap">
                    <table>{children}</table>
                  </div>
                ),
              }}
            >
              {section.body}
            </ReactMarkdown>
          </div>
        ) : (
          <ul className="doc-content">
            {section.children.map((c) => (
              <li key={c.id}>
                <Link href={`/${c.id}`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(prev || next) && (
        <div
          className="no-print sticky bottom-0 flex items-center justify-between gap-3 px-6 py-2.5 md:px-9"
          style={{ borderTop: "1px solid var(--br)", background: "var(--top)" }}
        >
          {prev ? (
            <Link
              href={`/${prev.id}`}
              className="min-w-0 truncate text-[13px]"
              style={{ color: "var(--mu)" }}
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/${next.id}`}
              className="min-w-0 truncate text-right text-[13px]"
              style={{ color: "var(--mu)" }}
            >
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
