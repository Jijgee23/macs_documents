import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getRagContext } from "@/lib/content";
import { getChatSettings } from "@/lib/settings";

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

  const settings = await getChatSettings();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: settings.unavailableMessage }, { status: 503 });
  }

  const matches = await getRagContext(message, 4);
  const context = matches.length
    ? matches.map((m) => `### ${m.title}\n${m.body}`).join("\n\n---\n\n")
    : "(Холбогдох баримт олдсонгүй)";

  const system = settings.rules
    ? `${settings.systemPrompt}\n\n${settings.rules}`
    : settings.systemPrompt;

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: settings.chatModel,
      max_tokens: 1500,
      system,
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
      answer: answer || settings.errorMessage,
      sources: matches.map((m) => ({ id: m.id, title: m.title })),
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth error — check ANTHROPIC_API_KEY:", err.message);
      return NextResponse.json({ error: settings.unavailableMessage }, { status: 503 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "AI туслах одоогоор ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу." },
        { status: 429 }
      );
    }
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: settings.errorMessage }, { status: 502 });
  }
}
