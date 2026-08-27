import { saveSettingsAction } from "@/lib/actions";
import { CHAT_MODEL_OPTIONS, getSettings } from "@/lib/settings";
import { Select } from "@/components/admin/Select";
import { cardStyle, errorBannerStyle, mutedStyle, primaryButtonStyle } from "@/components/admin/styles";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">Тохиргоо</h1>
      {error && (
        <p className="mb-4 p-3 text-sm" style={errorBannerStyle}>
          {error}
        </p>
      )}
      <div className="p-5" style={cardStyle}>
        <h2 className="mb-1 text-sm font-semibold">AI Туслах — Claude модель</h2>
        <p className="mb-4 text-[12.5px]" style={mutedStyle}>
          Баримт бичгээс хайж хариулдаг AI chat-д ашиглах Claude загварыг сонгоно уу.
        </p>
        <form action={saveSettingsAction} className="flex flex-wrap items-center gap-3">
          <Select name="chatModel" defaultValue={settings.chatModel} className="min-w-[280px]">
            {CHAT_MODEL_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </Select>
          <button type="submit" className="px-4 py-2 text-sm font-medium" style={primaryButtonStyle}>
            Хадгалах
          </button>
        </form>
      </div>
    </div>
  );
}
