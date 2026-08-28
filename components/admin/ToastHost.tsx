"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  leaving: boolean;
}

const DISPLAY_MS = 3000;
const EXIT_MS = 200;

export function ToastHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const pending = timersRef.current.get(id);
    if (pending) clearTimeout(pending);
    timersRef.current.delete(id);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  useEffect(() => {
    const message = searchParams.get("toast");
    if (!message) return;

    const type: ToastType = searchParams.get("toastType") === "error" ? "error" : "success";
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("toastType");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });

    // Not returned as an effect cleanup: router.replace() above produces a new
    // searchParams reference, which would immediately re-run this effect and
    // cancel the timer via cleanup before it ever fires.
    timersRef.current.set(
      id,
      setTimeout(() => dismiss(id), DISPLAY_MS)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => dismiss(t.id)}
          className="pointer-events-auto cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: t.type === "error" ? "var(--brd-l)" : "var(--tip-bg)",
            color: t.type === "error" ? "var(--brd)" : "var(--tip-tx)",
            border: `1px solid ${t.type === "error" ? "var(--brd-b)" : "var(--tip-br)"}`,
            boxShadow: "var(--shadow-lg)",
            opacity: t.leaving ? 0 : 1,
            transform: t.leaving ? "translateY(6px)" : "translateY(0)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
