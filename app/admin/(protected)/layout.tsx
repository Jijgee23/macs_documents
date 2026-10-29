import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { Logo } from "@/components/Logo";
import { ToastHost } from "@/components/admin/ToastHost";

const NAV_LINKS = [
  { href: "/admin", label: "Хэсгүүд" },
  { href: "/admin/modules", label: "Модулиуд" },
  { href: "/admin/settings", label: "Тохиргоо" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <header
        className="flex items-center gap-4 px-4 py-2.5 md:px-[18px]"
        style={{ borderBottom: "1px solid var(--br)", background: "var(--top)" }}
      >
        <div className="flex items-center gap-2.5">
          <Logo />
          <div className="hidden sm:block">
            <div className="text-[13px] font-bold" style={{ color: "var(--tx)" }}>
              InfoSystems
            </div>
            <div className="text-[10.5px]" style={{ color: "var(--mu)" }}>
              Admin панель
            </div>
          </div>
        </div>

        <nav className="flex flex-1 gap-1 text-[13.5px] font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[7px] px-3 py-1.5 transition-colors"
              style={{ color: "var(--tx)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          target="_blank"
          className="hidden text-[12.5px] sm:inline"
          style={{ color: "var(--mu)" }}
        >
          Баримт бичиг →
        </Link>

        <div className="flex items-center gap-3 text-[13px]">
          <span className="hidden sm:inline" style={{ color: "var(--mu)" }}>
            {session.email}
          </span>
          <form action={logoutAction}>
            <button type="submit" style={{ color: "var(--brd)" }}>
              Гарах
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <Suspense fallback={null}>
        <ToastHost />
      </Suspense>
    </div>
  );
}
