import { saveSettingsAction } from "@/lib/actions";
import {
  CHAT_MODEL_OPTIONS,
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_RULES,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_UNAVAILABLE_MESSAGE,
  getSettings,
} from "@/lib/settings";
import { Select } from "@/components/admin/Select";
import { Textarea } from "@/components/admin/Textarea";
import { cardStyle, errorBannerStyle, mutedStyle, primaryButtonStyle } from "@/components/admin/styles";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="w-full">
      <h1 className="mb-6 text-xl font-semibold">Тохиргоо</h1>
      {error && (
        <p className="mb-4 p-3 text-sm" style={errorBannerStyle}>
          {error}
        </p>
      )}
      <form action={saveSettingsAction} className="flex flex-col gap-5">
        <div className="p-5" style={cardStyle}>
          <h2 className="mb-1 text-sm font-semibold">AI Туслах — Claude модель</h2>
          <p className="mb-4 text-[12.5px]" style={mutedStyle}>
            Баримт бичгээс хайж хариулдаг AI chat-д ашиглах Claude загварыг сонгоно уу.
          </p>
          <Select name="chatModel" defaultValue={settings.chatModel} className="min-w-[280px] max-w-md">
            {CHAT_MODEL_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="p-5" style={cardStyle}>
            <h2 className="mb-1 text-sm font-semibold">Систем промпт</h2>
            <p className="mb-4 text-[12.5px]" style={mutedStyle}>
              AI-д өгөх үндсэн заавар. Хоосон орхивол доорх анхдагч утга хэрэглэгдэнэ.
            </p>
            <Textarea
              name="systemPrompt"
              rows={10}
              defaultValue={settings.systemPrompt ?? ""}
              placeholder={DEFAULT_SYSTEM_PROMPT}
            />
          </div>

          <div className="p-5" style={cardStyle}>
            <h2 className="mb-1 text-sm font-semibold">Нэмэлт дүрэм</h2>
            <p className="mb-4 text-[12.5px]" style={mutedStyle}>
              Систем промптод нэмж дагуулах дүрэм, хязгаарлалт (сонголтоор).
            </p>
            <Textarea
              name="rules"
              rows={10}
              defaultValue={settings.rules ?? ""}
              placeholder={DEFAULT_RULES || "Жишээ: Үргэлж эх сурвалжаа дурдана уу."}
            />
          </div>

          <div className="p-5" style={cardStyle}>
            <h2 className="mb-1 text-sm font-semibold">Боломжгүй үеийн мессеж</h2>
            <p className="mb-4 text-[12.5px]" style={mutedStyle}>
              ANTHROPIC_API_KEY тохируулагдаагүй эсвэл нэвтрэлт амжилтгүй үед харуулах мессеж.
            </p>
            <Textarea
              name="unavailableMessage"
              rows={4}
              defaultValue={settings.unavailableMessage ?? ""}
              placeholder={DEFAULT_UNAVAILABLE_MESSAGE}
            />
          </div>

          <div className="p-5" style={cardStyle}>
            <h2 className="mb-1 text-sm font-semibold">Алдааны мессеж</h2>
            <p className="mb-4 text-[12.5px]" style={mutedStyle}>
              AI хариулт өгч чадаагүй эсвэл серверийн алдаа гарсан үед харуулах мессеж.
            </p>
            <Textarea
              name="errorMessage"
              rows={4}
              defaultValue={settings.errorMessage ?? ""}
              placeholder={DEFAULT_ERROR_MESSAGE}
            />
          </div>
        </div>

        <div>
          <button type="submit" className="px-4 py-2 text-sm font-medium" style={primaryButtonStyle}>
            Хадгалах
          </button>
        </div>
      </form>
    </div>
  );
}
