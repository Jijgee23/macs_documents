"use client";

import type { TextareaHTMLAttributes } from "react";
import { fieldStyle } from "@/components/admin/styles";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 text-sm outline-none ${className}`}
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
  );
}
