"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={22}
        className="w-full p-3 font-mono text-sm outline-none"
        style={{ border: "1px solid var(--br)", background: "var(--inp)", color: "var(--tx)", borderRadius: 8 }}
      />
      <div
        className="doc-content overflow-y-auto p-3"
        style={{ border: "1px solid var(--br)", borderRadius: 8 }}
      >
        {value ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        ) : (
          <p style={{ color: "var(--mu)" }}>Урьдчилан харах...</p>
        )}
      </div>
    </div>
  );
}
