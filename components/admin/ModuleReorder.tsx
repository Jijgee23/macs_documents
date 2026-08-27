"use client";

import { useState, useTransition } from "react";
import {
  deleteModuleAction,
  moveModuleAction,
  renameModuleAction,
  reorderModulesAction,
} from "@/lib/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { cardStyle, fieldStyle, linkStyle, mutedStyle } from "@/components/admin/styles";

interface ModuleItem {
  id: string;
  title: string;
  sectionCount: number;
}

export function ModuleReorder({ initialModules }: { initialModules: ModuleItem[] }) {
  const [modules, setModules] = useState(initialModules);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDrop(targetId: string) {
    setOverId(null);
    const sourceId = draggedId;
    setDraggedId(null);
    if (!sourceId || sourceId === targetId) return;

    const from = modules.findIndex((m) => m.id === sourceId);
    const to = modules.findIndex((m) => m.id === targetId);
    if (from === -1 || to === -1) return;

    const next = [...modules];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    setModules(next);
    startTransition(() => {
      reorderModulesAction(next.map((m) => m.id));
    });
  }

  return (
    <ul className="mb-8 transition-opacity" style={{ ...cardStyle, opacity: isPending ? 0.7 : 1 }}>
      {modules.map((m, idx) => (
        <li
          key={m.id}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedId && draggedId !== m.id) setOverId(m.id);
          }}
          onDragLeave={() => setOverId((cur) => (cur === m.id ? null : cur))}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(m.id);
          }}
          className="flex items-center gap-3 px-4 py-3"
          style={{
            borderTop:
              idx > 0 ? `1px solid ${overId === m.id ? "var(--brd)" : "var(--br)"}` : undefined,
            opacity: draggedId === m.id ? 0.4 : 1,
          }}
        >
          <span
            draggable
            onDragStart={() => setDraggedId(m.id)}
            onDragEnd={() => {
              setDraggedId(null);
              setOverId(null);
            }}
            aria-hidden="true"
            className="shrink-0 select-none"
            style={{ color: "var(--s-l)", cursor: "grab", fontSize: 14 }}
            title="Чирж эрэмбэлэх"
          >
            ⠿
          </span>
          <form action={moveModuleAction.bind(null, m.id, "up")}>
            <button type="submit" disabled={idx === 0} className="disabled:opacity-30" aria-label="Дээш">
              ↑
            </button>
          </form>
          <form action={moveModuleAction.bind(null, m.id, "down")}>
            <button
              type="submit"
              disabled={idx === modules.length - 1}
              className="disabled:opacity-30"
              aria-label="Доош"
            >
              ↓
            </button>
          </form>
          <form action={renameModuleAction.bind(null, m.id)} className="flex flex-1 items-center gap-2">
            <input
              name="title"
              defaultValue={m.title}
              className="flex-1 px-2 py-1 text-sm outline-none"
              style={fieldStyle}
            />
            <button type="submit" className="text-sm hover:underline" style={linkStyle}>
              Хадгалах
            </button>
          </form>
          <span className="text-xs whitespace-nowrap" style={mutedStyle}>
            {m.sectionCount} хэсэг
          </span>
          <form action={deleteModuleAction.bind(null, m.id)}>
            <ConfirmButton
              message={`"${m.title}" модулийг устгах уу? Дотор нь бүх хэсэг устана!`}
              className="text-sm hover:underline"
              style={linkStyle}
            >
              Устгах
            </ConfirmButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
