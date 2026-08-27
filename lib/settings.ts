import "server-only";
import { db } from "@/lib/db";

export const CHAT_MODEL_OPTIONS = [
  { id: "claude-opus-5", label: "Claude Opus 5 — хамгийн чадварлаг (үнэтэй)" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 — тэнцвэртэй" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — хурдан, хямд" },
  { id: "claude-fable-5", label: "Claude Fable 5 — хамгийн чадварлаг (илүү үнэтэй)" },
] as const;

const DEFAULT_CHAT_MODEL = "claude-opus-5";

export async function getSettings() {
  return db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", chatModel: DEFAULT_CHAT_MODEL },
    update: {},
  });
}

export async function getChatModel(): Promise<string> {
  const settings = await getSettings();
  return settings.chatModel;
}
