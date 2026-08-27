import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getRagContext } from "@/lib/content";
import { getChatModel } from "@/lib/settings";

const UNAVAILABLE_MESSAGE =
  "Уучлаарай, AI туслах одоогоор боломжгүй байна. Серверийн ANTHROPIC_API_KEY тохируулагдсан эсэхийг шалгана уу.";
const ERROR_MESSAGE = "Уучлаарай, AI туслах одоогоор боломжгүй байна. Түр хүлээгээд дахин оролдоно уу.";

const SYSTEM_PROMPT = `Та бол "MACS ERP / MacsXE4 / MACS POS" системийн монгол хэл дээрх баримт бичгийн AI туслах.
Зөвхөн хэрэглэгчийн зурвасын өмнө өгөгдсөн "Холбогдох баримт" хэсэгт байгаа мэдээллийг үндэслэн хариулна уу.
Хэрэв асуултад хариулах мэдээлэл холбогдох баримтад байхгүй бол мэдэхгүй гэдгээ шууд хэлж, зохиомол мэдээлэл бүү өг.
Хариултаа товч бөгөөд ойлгомжтой монгол хэлээр бич.`;

export async function POST(request: NextRequest) {
  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Хүсэлтийн формат буруу" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "message шаардлагатай" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
  }

  const [matches, model] = await Promise.all([getRagContext(message, 4), getChatModel()]);
  const context = matches.length
    ? matches.map((m) => `### ${m.title}\n${m.body}`).join("\n\n---\n\n")
    : "(Холбогдох баримт олдсонгүй)";

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Холбогдох баримт:\n${context}\n\n---\nХэрэглэгчийн асуулт: ${message}`,
        },
      ],
    });

    const answer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return NextResponse.json({
      answer: answer || ERROR_MESSAGE,
      sources: matches.map((m) => ({ id: m.id, title: m.title })),
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth error — check ANTHROPIC_API_KEY:", err.message);
      return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "AI туслах одоогоор ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу." },
        { status: 429 }
      );
    }
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: ERROR_MESSAGE }, { status: 502 });
  }
}
