"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getFavorites, getRecent, onLibraryChange, type LibraryEntry } from "@/lib/localLibrary";

function LibraryList({ title, icon, entries }: { title: string; icon: string; entries: LibraryEntry[] }) {
  const pathname = usePathname();
  if (entries.length === 0) return null;

  return (
    <div className="mb-3">
      <div
        className="mb-1 px-1.5 text-[10.5px] font-bold tracking-wide uppercase"
        style={{ color: "var(--s-l)" }}
      >
        {icon} {title}
      </div>
      <ul className="space-y-0.5">
        {entries.map((e) => {
          const active = pathname === `/${e.id}`;
          return (
            <li key={e.id}>
              <Link
                href={`/${e.id}`}
                className="mx-1.5 block truncate rounded-[6px] px-2 py-1 text-[13px]"
                style={{
                  background: active ? "var(--nav-a)" : "transparent",
                  color: active ? "var(--a-t)" : "var(--tx)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {e.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SidebarLibrary() {
  const [favorites, setFavorites] = useState<LibraryEntry[]>([]);
  const [recent, setRecent] = useState<LibraryEntry[]>([]);

  useEffect(() => {
    function refresh() {
      setFavorites(getFavorites());
      setRecent(getRecent());
    }
    refresh();
    return onLibraryChange(refresh);
  }, []);

  if (favorites.length === 0 && recent.length === 0) return null;

  return (
    <div className="mb-3 border-b pb-3" style={{ borderColor: "var(--br)" }}>
      <LibraryList title="Тэмдэглэсэн" icon="★" entries={favorites} />
      <LibraryList title="Сүүлд үзсэн" icon="🕐" entries={recent} />
    </div>
  );
}
