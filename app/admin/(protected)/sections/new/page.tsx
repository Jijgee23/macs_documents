import { db } from "@/lib/db";
import { saveSectionAction } from "@/lib/actions";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Select } from "@/components/admin/Select";
import { errorBannerStyle, fieldStyle, primaryButtonStyle } from "@/components/admin/styles";

export default async function NewSectionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [modules, topLevelSections] = await Promise.all([
    db.module.findMany({ orderBy: { order: "asc" } }),
    db.section.findMany({
      where: { parentId: null },
      orderBy: { title: "asc" },
      include: { module: true },
    }),
  ]);

  const action = saveSectionAction.bind(null, true);

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-xl font-semibold">Шинэ хэсэг</h1>
      {error && (
        <p className="mb-4 p-3 text-sm" style={errorBannerStyle}>
          {error}
        </p>
      )}
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">ID (URL slug, жиш: pos-pay-qr)</label>
          <input name="id" required pattern="[a-z0-9-]+" className="mt-1 w-full px-3 py-2 outline-none" style={fieldStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium">Гарчиг</label>
          <input name="title" required className="mt-1 w-full px-3 py-2 outline-none" style={fieldStyle} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Модуль</label>
            <Select name="moduleId" required className="mt-1">
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium">Эцэг хэсэг (сонголт)</label>
            <Select name="parentId" className="mt-1">
              <option value="">— Дээд түвшин —</option>
              {topLevelSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.module.title} / {s.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Эрэмбэ (тоо)</label>
          <input
            name="order"
            type="number"
            defaultValue={0}
            className="mt-1 w-32 px-3 py-2 outline-none"
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Агуулга (Markdown)</label>
          <MarkdownEditor name="body" />
        </div>
        <button type="submit" className="px-4 py-2 text-sm font-medium" style={primaryButtonStyle}>
          Хадгалах
        </button>
      </form>
    </div>
  );
}
