"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  snippet: string | null;
  moduleTitle: string;
}

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const displayResults = query.trim() ? results : [];

  function goToResult(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/${id}`);
  }

  return (
    <div ref={boxRef} className="relative">
      <span
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px]"
        style={{ color: "var(--mu)" }}
      >
        🔍
      </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Хайх..."
        aria-label="Баримт бичгээс хайх"
        className="w-full text-[13.5px] transition-[border-color,box-shadow] outline-none"
        style={{
          padding: "7px 46px 7px 30px",
          border: "1.5px solid var(--br)",
          borderRadius: 8,
          background: "var(--inp)",
          color: "var(--tx)",
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = "var(--brd)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(153,27,27,0.08)";
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = "var(--br)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[12px]"
          style={{ color: "var(--mu)" }}
          aria-label="Хайлт цэвэрлэх"
        >
          ✕
        </button>
      ) : (
        <span
          className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px]"
          style={{
            border: "1px solid var(--br)",
            borderRadius: 4,
            padding: "1px 5px",
            color: "var(--mu)",
          }}
        >
          ⌘K
        </span>
      )}

      {open && query.trim() && (
        <div
          className="absolute right-0 left-0 z-20 max-h-80 overflow-y-auto"
          style={{
            top: "calc(100% + 6px)",
            border: "1px solid var(--br)",
            borderRadius: 9,
            background: "var(--top)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {displayResults.length === 0 ? (
            <p className="p-4 text-[13px]" style={{ color: "var(--mu)" }}>
              «{query}» гэсэн үг олдсонгүй...
            </p>
          ) : (
            <ul>
              {displayResults.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/${r.id}`}
                    onClick={() => goToResult(r.id)}
                    className="block px-4 py-2.5 transition-colors"
                    style={{ borderBottom: "1px solid var(--br)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hv)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="text-[13.5px] font-medium" style={{ color: "var(--tx)" }}>
                      {r.title}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--s-l)" }}>
                      {r.moduleTitle}
                    </div>
                    {r.snippet && (
                      <p className="mt-0.5 text-[12px]" style={{ color: "var(--mu)" }}>
                        …{r.snippet}…
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
