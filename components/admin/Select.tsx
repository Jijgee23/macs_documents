"use client";

import type { SelectHTMLAttributes } from "react";
import { fieldStyle } from "@/components/admin/styles";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select
        {...props}
        className="w-full appearance-none px-3 py-2 pr-9 text-sm outline-none"
        style={fieldStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--brd)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(153,27,27,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--br)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <svg
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 1L5 5L9 1" stroke="var(--mu)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
