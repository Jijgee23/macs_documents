"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkle } from "@/components/Sparkle";

interface ChatSource {
  id: string;
  title: string;
}
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
  }, [input]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer, sources: data.sources },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Уучлаарай, AI туслах одоогоор боломжгүй байна. Түр хүлээгээд дахин оролдоно уу.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="AI туслахаас асуух"
          className="no-print ai-fab-pulse fixed right-4 bottom-[78px] z-[801] flex h-[58px] w-[58px] items-center justify-center rounded-full text-white sm:right-6 sm:bottom-[88px]"
          style={{ background: "var(--ai-grad)" }}
        >
          <Sparkle size={24} />
        </button>
      )}

      {open && (
        <div
          className="no-print fixed inset-0 z-[800] flex w-full flex-col sm:inset-auto sm:bottom-[92px] sm:right-6 sm:h-[568px] sm:max-h-[calc(100vh-120px)] sm:w-[388px] sm:rounded-[18px]"
          style={{ background: "var(--bg)", boxShadow: "var(--ai-panel-shadow)" }}
        >
          <div
            className="flex items-center gap-2.5 p-3.5"
            style={{ borderBottom: "1px solid var(--br)" }}
          >
            <div
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: "var(--ai-grad)" }}
            >
              <Sparkle size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold" style={{ color: "var(--tx)" }}>
                AI Туслах
              </div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--mu)" }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                Баримт бичгээс хайж хариулна
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Хаах"
              className="shrink-0 rounded-md px-1.5 py-1 text-sm"
              style={{ color: "var(--mu)" }}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center px-4 pt-10 text-center">
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: "var(--ai-l)" }}
                >
                  <Sparkle size={20} color="var(--ai)" />
                </div>
                <p className="mb-1.5 text-[14px] font-semibold" style={{ color: "var(--tx)" }}>
                  Юугаар туслах вэ?
                </p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--mu)" }}>
                  MACS ERP, MacsXE4, MACS POS-ийн талаар асуултаа бичээрэй — баримт бичгээс хайж
                  танд хариулна.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="flex" style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div
                    className="mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center self-end rounded-full"
                    style={{ background: "var(--ai-grad)" }}
                  >
                    <Sparkle size={13} />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div
                    className="px-3.5 py-2.5 text-[13.5px]"
                    style={{
                      whiteSpace: "pre-wrap",
                      borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "3px 14px 14px 14px",
                      background: m.role === "user" ? "var(--brd)" : "var(--ai-bubble)",
                      border: m.role === "assistant" ? "1px solid var(--ai-b)" : undefined,
                      color: m.role === "user" ? "#fff" : "var(--tx)",
                    }}
                  >
                    {m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <p className="mt-1 px-1 text-[11px]" style={{ color: "var(--mu)" }}>
                      📄 {m.sources.map((s) => s.title).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end">
                <div
                  className="mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--ai-grad)" }}
                >
                  <Sparkle size={13} />
                </div>
                <div
                  className="flex items-center gap-1 px-3.5 py-3"
                  style={{
                    borderRadius: "3px 14px 14px 14px",
                    background: "var(--ai-bubble)",
                    border: "1px solid var(--ai-b)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{
                        background: "var(--ai)",
                        animation: `aiDotPulse 1.1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-end gap-2 p-3" style={{ borderTop: "1px solid var(--br)" }}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Асуулта бичнэ үү..."
              className="flex-1 resize-none text-[13.5px] outline-none"
              style={{
                maxHeight: 80,
                padding: "9px 12px",
                border: "1px solid var(--br)",
                borderRadius: 10,
                background: "var(--inp)",
                color: "var(--tx)",
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Илгээх"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full transition-colors"
              style={{
                background: input.trim() ? "var(--ai-grad)" : "var(--br)",
                color: input.trim() ? "#fff" : "var(--mu)",
                boxShadow: input.trim() ? "0 3px 10px var(--ai-glow)" : undefined,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
