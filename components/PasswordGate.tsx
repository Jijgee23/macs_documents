"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";

const UNLOCK_KEY = "macs-docs-unlocked";
const SITE_PASSWORD = "macs2026";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") {
        // Reads sessionStorage (unavailable during SSR) — post-mount sync is unavoidable here.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUnlocked(true);
        return;
      }
    } catch {}

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("unlock") === SITE_PASSWORD) {
        sessionStorage.setItem(UNLOCK_KEY, "1");
        setUnlocked(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("unlock");
        window.history.replaceState({}, "", url.toString());
        return;
      }
    } catch {}

    setUnlocked(false);
  }, []);

  if (unlocked === null) {
    return <div style={{ background: "var(--bg)", height: "100dvh" }} />;
  }
  if (!unlocked) {
    return <PasswordPrompt onUnlock={() => setUnlocked(true)} />;
  }
  return <>{children}</>;
}

function PasswordPrompt({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit() {
    if (value === SITE_PASSWORD) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {}
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setValue("");
      inputRef.current?.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex h-[100dvh] w-full items-center justify-center p-5"
      style={{ background: "linear-gradient(135deg,var(--bg) 0%,var(--sb) 100%)" }}
    >
      <div
        className={shake ? "shake-x" : ""}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--top)",
          borderRadius: 16,
          border: "1px solid var(--br)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          padding: "36px 32px",
          textAlign: "center",
        }}
      >
        <div className="mx-auto mb-[18px] w-fit">
          <Logo size="lg" />
        </div>
        <div className="mb-1 text-[15px] font-bold" style={{ color: "var(--tx)", letterSpacing: "-0.01em" }}>
          InfoSystems Mongolia
        </div>
        <div className="mb-6 text-[12.5px]" style={{ color: "var(--mu)" }}>
          Баримт бичигт нэвтрэхийн тулд нууц үг оруулна уу
        </div>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Нууц үг"
          autoFocus
          className="w-full outline-none"
          style={{
            padding: "11px 14px",
            fontSize: 16,
            border: `1.5px solid ${error ? "#dc2626" : "var(--br)"}`,
            borderRadius: 10,
            background: "var(--inp)",
            color: "var(--tx)",
            marginBottom: error ? 8 : 16,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "var(--brd)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(153,27,27,0.08)";
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#dc2626" : "var(--br)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {error && (
          <div className="mb-4 text-left text-[12px]" style={{ color: "#dc2626" }}>
            Нууц үг буруу байна. Дахин оролдоно уу.
          </div>
        )}
        <button
          type="button"
          onClick={submit}
          className="w-full text-sm font-semibold"
          style={{
            padding: "11px 14px",
            background: "var(--brd)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
          }}
        >
          Нэвтрэх
        </button>
        <div className="mt-5 text-[11px]" style={{ color: "var(--s-l)" }}>
          www.infosystems.mn · 7012 6399
        </div>
      </div>
    </div>
  );
}
