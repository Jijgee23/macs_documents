import "server-only";
import { db } from "@/lib/db";

export const CHAT_MODEL_OPTIONS = [
  { id: "claude-opus-5", label: "Claude Opus 5 — хамгийн чадварлаг (үнэтэй)" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 — тэнцвэртэй" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — хурдан, хямд" },
  { id: "claude-fable-5", label: "Claude Fable 5 — хамгийн чадварлаг (илүү үнэтэй)" },
] as const;

const DEFAULT_CHAT_MODEL = "claude-opus-5";

export const DEFAULT_SYSTEM_PROMPT = `Та бол "MACS ERP / MacsXE4 / MACS POS" системийн монгол хэл дээрх баримт бичгийн AI туслах.
Зөвхөн хэрэглэгчийн зурвасын өмнө өгөгдсөн "Холбогдох баримт" хэсэгт байгаа мэдээллийг үндэслэн хариулна уу.
Хэрэв асуултад хариулах мэдээлэл холбогдох баримтад байхгүй бол мэдэхгүй гэдгээ шууд хэлж, зохиомол мэдээлэл бүү өг.
Хариултаа товч бөгөөд ойлгомжтой монгол хэлээр бич.`;

export const DEFAULT_RULES = "";

export const DEFAULT_UNAVAILABLE_MESSAGE =
  "Уучлаарай, AI туслах одоогоор боломжгүй байна. Серверийн ANTHROPIC_API_KEY тохируулагдсан эсэхийг шалгана уу.";

export const DEFAULT_ERROR_MESSAGE =
  "Уучлаарай, AI туслах одоогоор боломжгүй байна. Түр хүлээгээд дахин оролдоно уу.";

export async function getSettings() {
  return db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", chatModel: DEFAULT_CHAT_MODEL },
    update: {},
  });
}

export async function getChatSettings() {
  const settings = await getSettings();
  return {
    chatModel: settings.chatModel,
    systemPrompt: settings.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    rules: settings.rules ?? DEFAULT_RULES,
    unavailableMessage: settings.unavailableMessage || DEFAULT_UNAVAILABLE_MESSAGE,
    errorMessage: settings.errorMessage || DEFAULT_ERROR_MESSAGE,
  };
}
