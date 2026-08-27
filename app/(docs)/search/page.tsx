import Link from "next/link";
import { searchSections } from "@/lib/content";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? await searchSections(q) : [];

  return (
    <div className="mx-auto max-w-[800px] px-6 py-9 md:px-9">
      <form action="/search" method="GET" className="mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Хайх..."
          className="w-full text-[14px] outline-none"
          style={{
            padding: "9px 14px",
            border: "1.5px solid var(--br)",
            borderRadius: 8,
            background: "var(--inp)",
            color: "var(--tx)",
          }}
        />
      </form>
      {q && (
        <p className="mb-4 text-[13px]" style={{ color: "var(--mu)" }}>
          &quot;{q}&quot; — {results.length} үр дүн олдлоо
        </p>
      )}
      <ul className="doc-content">
        {results.map((r) => (
          <li key={r.id} style={{ display: "block" }}>
            <Link
              href={`/${r.id}`}
              className="text-[14px] font-medium"
              style={{ color: "var(--brd)" }}
            >
              {r.title}
            </Link>
            <div className="text-[11px]" style={{ color: "var(--s-l)" }}>
              {r.moduleTitle}
            </div>
            {r.snippet && (
              <p className="mt-0.5 text-[13px]" style={{ color: "var(--mu)" }}>
                …{r.snippet}…
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
