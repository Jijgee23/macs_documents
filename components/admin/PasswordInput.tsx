"use client";

import { useState } from "react";

export function PasswordInput({ name, required }: { name: string; required?: boolean }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        className="w-full rounded px-3 py-2 pr-10 outline-none"
        style={{ border: "1px solid var(--br)", background: "var(--inp)", color: "var(--tx)" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--brd)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(153,27,27,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--br)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Нууц үг нуух" : "Нууц үг харуулах"}
        tabIndex={-1}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[13px]"
        style={{ color: "var(--mu)" }}
      >
        {visible ? "🙈" : "👁"}
      </button>
    </div>
  );
}
