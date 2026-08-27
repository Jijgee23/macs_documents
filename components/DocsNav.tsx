"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

function NavLink({ id, title, nested = false }: NavChild & { nested?: boolean }) {
  const pathname = usePathname();
  const active = pathname === `/${id}`;

  return (
    <Link
      href={`/${id}`}
      className="mx-1.5 block truncate text-[13.5px] transition-colors"
      style={{
        width: "calc(100% - 12px)",
        padding: nested ? "7px 10px 7px 26px" : "7px 10px",
        fontSize: nested ? 13 : 13.5,
        borderRadius: active ? 8 : 0,
        boxShadow: active ? "inset 3px 0 0 var(--brd)" : undefined,
        background: active ? "var(--nav-a)" : "transparent",
        color: active ? "var(--a-t)" : nested ? "var(--mu)" : "var(--tx)",
        fontWeight: active ? 600 : 400,
        borderBottom: "1px solid var(--nav-div)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--hv)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {title}
    </Link>
  );
}

function ModuleGroup({ mod }: { mod: NavModule }) {
  const pathname = usePathname();
  const hasActive =
    mod.sections.some((s) => `/${s.id}` === pathname) ||
    mod.sections.some((s) => s.children.some((c) => `/${c.id}` === pathname));
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mb-1 flex w-full items-center gap-1.5 rounded-[6px] px-1.5 py-1.5 text-left transition-colors"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hv)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span
          className="inline-block h-3.5 w-3.5 shrink-0 text-center transition-transform"
          style={{
            color: expanded ? "var(--brd)" : "var(--e-b)",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            fontSize: 9,
          }}
        >
          ▶
        </span>
        <span
          className="truncate uppercase"
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: expanded || hasActive ? "var(--brd)" : "var(--s-l)",
          }}
        >
          {mod.title}
        </span>
      </button>
      {expanded && (
        <ul className="mb-1 space-y-0">
          {mod.sections.map((s) => (
            <li key={s.id}>
              <NavLink id={s.id} title={s.title} />
              {s.children.length > 0 && (
                <ul>
                  {s.children.map((c) => (
                    <li key={c.id}>
                      <NavLink id={c.id} title={c.title} nested />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DocsNav({ modules }: { modules: NavModule[] }) {
  return (
    <nav className="space-y-4">
      {modules.map((m) => (
        <ModuleGroup key={m.id} mod={m} />
      ))}
    </nav>
  );
}
