"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBox } from "@/components/SearchBox";
import { DocsNav } from "@/components/DocsNav";
import { SidebarLibrary } from "@/components/SidebarLibrary";
import { AiChat } from "@/components/AiChat";

interface NavChild {
  id: string;
  title: string;
}
interface NavSection extends NavChild {
  children: NavChild[];
}
interface NavModule {
  id: string;
  title: string;
  sections: NavSection[];
}

function useBreadcrumb(modules: NavModule[]) {
  const pathname = usePathname();
  const activeId = pathname.replace(/^\//, "");

  for (const m of modules) {
    for (const s of m.sections) {
      if (s.id === activeId) return { moduleTitle: m.title, pageTitle: s.title };
      for (const c of s.children) {
        if (c.id === activeId) return { moduleTitle: m.title, pageTitle: c.title };
      }
    }
  }
  return { moduleTitle: "", pageTitle: "" };
}

export function DocsShell({
  modules,
  children,
}: {
  modules: NavModule[];
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { moduleTitle, pageTitle } = useBreadcrumb(modules);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {sidebarOpen && (
        <div
          className="no-print fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className="no-print fixed inset-y-0 left-0 z-40 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] md:static"
        style={{
          width: sidebarOpen ? 268 : 0,
          background: "var(--sb-grad)",
          borderRight: sidebarOpen ? "1px solid var(--br)" : "none",
        }}
      >
        <div className="flex h-full w-[268px] flex-col">
          <div className="flex items-center gap-2.5 p-4">
            <Logo />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold" style={{ color: "var(--tx)" }}>
                InfoSystems
              </div>
              <div className="truncate text-[10.5px]" style={{ color: "var(--mu)" }}>
                MACS ERP · MacsXE4 · POS
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <SidebarLibrary />
            <DocsNav modules={modules} />
          </div>
          <div
            className="flex items-center justify-between gap-2 p-3"
            style={{ borderTop: "1px solid var(--br)" }}
          >
            <span className="truncate text-[10.5px]" style={{ color: "var(--mu)" }}>
              www.infosystems.mn · 70126399
            </span>
            <ThemeToggle collapsed />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="no-print flex items-center gap-2.5 px-3 py-[7px] backdrop-blur-sm md:px-[18px]"
          style={{ borderBottom: "1px solid var(--br)", background: "var(--top)" }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Цэс хаах" : "Цэс нээх"}
            aria-expanded={sidebarOpen}
            title="Цэс хаах/нээх (Ctrl+K хайх)"
            className="shrink-0 transition-colors"
            style={{
              padding: "5px 8px",
              border: "1px solid var(--br)",
              borderRadius: 7,
              background: "transparent",
              color: "var(--mu)",
              fontSize: 14,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--hv)";
              e.currentTarget.style.borderColor = "var(--brd)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--br)";
            }}
          >
            ☰
          </button>

          <div
            className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden"
            style={{ fontSize: 12.5, color: "var(--mu)" }}
          >
            <span className="hidden whitespace-nowrap sm:inline">InfoSystems</span>
            <span className="hidden sm:inline" style={{ opacity: 0.4 }}>
              ›
            </span>
            <span className="hidden truncate whitespace-nowrap sm:inline">{moduleTitle}</span>
            <span className="hidden sm:inline" style={{ opacity: 0.4 }}>
              ›
            </span>
            <span
              className="truncate"
              style={{ color: "var(--tx)", fontWeight: 500 }}
            >
              {pageTitle}
            </span>
          </div>

          <div className="w-[200px] max-w-[45vw] shrink-0">
            <SearchBox />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Хэвлэх"
            title="Хэвлэх (Ctrl+P)"
            className="shrink-0 transition-colors"
            style={{
              padding: "5px 8px",
              border: "1px solid var(--br)",
              borderRadius: 7,
              background: "transparent",
              color: "var(--mu)",
              fontSize: 14,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--hv)";
              e.currentTarget.style.borderColor = "var(--brd)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--br)";
            }}
          >
            🖨
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <AiChat />
    </div>
  );
}
