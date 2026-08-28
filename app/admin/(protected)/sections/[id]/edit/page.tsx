import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteSectionAction, saveSectionAction } from "@/lib/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Select } from "@/components/admin/Select";
import { errorBannerStyle, fieldStyle, linkStyle, mutedStyle, primaryButtonStyle } from "@/components/admin/styles";

export default async function EditSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [section, modules, topLevelSections] = await Promise.all([
    db.section.findUnique({ where: { id } }),
    db.module.findMany({ orderBy: { order: "asc" } }),
    db.section.findMany({
      where: { parentId: null, id: { not: id } },
      orderBy: { title: "asc" },
      include: { module: true },
    }),
  ]);

  if (!section) notFound();

  const action = saveSectionAction.bind(null, false);
  const deleteAction = deleteSectionAction.bind(null, id);

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Хэсэг засах — <span className="font-mono text-base" style={mutedStyle}>{section.id}</span>
        </h1>
        <form action={deleteAction}>
          <ConfirmButton message={`"${section.title}" хэсгийг устгах уу?`} className="text-sm hover:underline" style={linkStyle}>
            Устгах
          </ConfirmButton>
        </form>
      </div>
      {error && (
        <p className="mb-4 p-3 text-sm" style={errorBannerStyle}>
          {error}
        </p>
      )}
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={section.id} />
        <div>
          <label className="block text-sm font-medium">Гарчиг</label>
          <input
            name="title"
            required
            defaultValue={section.title}
            className="mt-1 w-full px-3 py-2 outline-none"
            style={fieldStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Модуль</label>
            <Select name="moduleId" required defaultValue={section.moduleId} className="mt-1">
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium">Эцэг хэсэг (сонголт)</label>
            <Select name="parentId" defaultValue={section.parentId ?? ""} className="mt-1">
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
            defaultValue={section.order}
            className="mt-1 w-32 px-3 py-2 outline-none"
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Агуулга (Markdown)</label>
          <MarkdownEditor name="body" defaultValue={section.body ?? ""} />
        </div>
        <button type="submit" className="px-4 py-2 text-sm font-medium" style={primaryButtonStyle}>
          Хадгалах
        </button>
      </form>
    </div>
  );
}
