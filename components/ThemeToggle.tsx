"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Reads DOM state set by the pre-hydration inline script in layout.tsx —
    // can't be computed during SSR, so a post-mount sync is unavoidable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("macs-docs-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-[7px] border-[1.5px] text-[12px] transition-colors"
      style={{
        padding: collapsed ? "5px 9px" : "5px 11px",
        borderColor: isDark ? "var(--brd)" : "var(--br)",
        background: isDark ? "var(--brd)" : "transparent",
        color: isDark ? "#fff" : "var(--mu)",
      }}
    >
      <span>{isDark ? "🌙" : "☀"}</span>
      {!collapsed && <span>{isDark ? "Харанхуй" : "Гэрэл"}</span>}
    </button>
  );
}
