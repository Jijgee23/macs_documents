import { db } from "@/lib/db";
import { createModuleAction } from "@/lib/actions";
import { ModuleReorder } from "@/components/admin/ModuleReorder";
import { errorBannerStyle, fieldStyle, mutedStyle, primaryButtonStyle } from "@/components/admin/styles";

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const modules = await db.module.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { sections: true } } },
  });

  const moduleItems = modules.map((m) => ({
    id: m.id,
    title: m.title,
    sectionCount: m._count.sections,
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Модулиуд</h1>
      <p className="mb-6 text-[12.5px]" style={mutedStyle}>
        ⠿ дэлгэц дээр чирж эсвэл ↑↓ товчоор эрэмбэлнэ үү.
      </p>
      {error && (
        <p className="mb-4 p-3 text-sm" style={errorBannerStyle}>
          {error}
        </p>
      )}
      <ModuleReorder initialModules={moduleItems} />
      <form action={createModuleAction} className="flex gap-2">
        <input
          name="title"
          required
          placeholder="Шинэ модулийн нэр"
          className="flex-1 px-3 py-2 text-sm outline-none"
          style={fieldStyle}
        />
        <button type="submit" className="px-4 py-2 text-sm font-medium" style={primaryButtonStyle}>
          Нэмэх
        </button>
      </form>
    </div>
  );
}
