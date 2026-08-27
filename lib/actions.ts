"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, requireAdmin, verifyPassword } from "@/lib/auth";
import { CHAT_MODEL_OPTIONS } from "@/lib/settings";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await db.adminUser.findUnique({ where: { email } });
  const valid = user && (await verifyPassword(password, user.passwordHash));

  if (!user || !valid) {
    redirect(`/admin/login?error=${encodeURIComponent("И-мэйл эсвэл нууц үг буруу байна.")}`);
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.isLoggedIn = true;
  await session.save();

  redirect("/admin");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

const sectionSchema = z.object({
  id: z
    .string()
    .min(1, "ID шаардлагатай")
    .regex(/^[a-z0-9-]+$/, "ID нь зөвхөн латин жижиг үсэг, тоо, зураас (-) агуулна"),
  title: z.string().min(1, "Гарчиг шаардлагатай"),
  body: z.string().optional(),
  moduleId: z.string().min(1, "Модуль сонгоно уу"),
  parentId: z.string().optional(),
  order: z.coerce.number().int().default(0),
});

export async function saveSectionAction(isNew: boolean, formData: FormData) {
  await requireAdmin();

  const raw = {
    id: String(formData.get("id") ?? ""),
    title: formData.get("title"),
    body: formData.get("body"),
    moduleId: formData.get("moduleId"),
    parentId: formData.get("parentId") || undefined,
    order: formData.get("order") ?? 0,
  };

  const parsed = sectionSchema.safeParse(raw);
  const backPath = isNew ? "/admin/sections/new" : `/admin/sections/${raw.id}/edit`;

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Буруу мэдээлэл";
    redirect(`${backPath}?error=${encodeURIComponent(message)}`);
  }

  const { id, title, body, moduleId, parentId, order } = parsed.data;

  if (parentId === id) {
    redirect(`${backPath}?error=${encodeURIComponent("Хэсэг өөрийгөө эцэг болгож чадахгүй")}`);
  }

  if (isNew) {
    const existing = await db.section.findUnique({ where: { id } });
    if (existing) {
      redirect(`${backPath}?error=${encodeURIComponent("Энэ ID аль хэдийн байна")}`);
    }
    await db.section.create({
      data: { id, title, body: body || null, moduleId, parentId: parentId || null, order },
    });
  } else {
    await db.section.update({
      where: { id },
      data: { title, body: body || null, moduleId, parentId: parentId || null, order },
    });
  }

  revalidatePath(`/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteSectionAction(id: string) {
  await requireAdmin();
  await db.section.delete({ where: { id } });
  revalidatePath(`/${id}`);
  revalidatePath("/admin");
}

const moduleSchema = z.object({
  title: z.string().min(1, "Гарчиг шаардлагатай"),
});

export async function createModuleAction(formData: FormData) {
  await requireAdmin();
  const parsed = moduleSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    redirect(`/admin/modules?error=${encodeURIComponent("Гарчиг оруулна уу")}`);
  }

  const maxOrder = await db.module.aggregate({ _max: { order: true } });
  await db.module.create({
    data: { title: parsed.data.title, order: (maxOrder._max.order ?? -1) + 1 },
  });
  revalidatePath("/admin/modules");
  revalidatePath("/");
}

export async function renameModuleAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = moduleSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    redirect(`/admin/modules?error=${encodeURIComponent("Гарчиг оруулна уу")}`);
  }
  await db.module.update({ where: { id }, data: { title: parsed.data.title } });
  revalidatePath("/admin/modules");
  revalidatePath("/");
}

export async function deleteModuleAction(id: string) {
  await requireAdmin();
  await db.module.delete({ where: { id } });
  revalidatePath("/admin/modules");
  revalidatePath("/");
}

export async function moveModuleAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const modules = await db.module.findMany({ orderBy: { order: "asc" } });
  const idx = modules.findIndex((m) => m.id === id);
  if (idx === -1) return;

  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= modules.length) return;

  const a = modules[idx];
  const b = modules[swapWith];
  await db.$transaction([
    db.module.update({ where: { id: a.id }, data: { order: b.order } }),
    db.module.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  revalidatePath("/admin/modules");
  revalidatePath("/");
}

export async function reorderModulesAction(orderedIds: string[]) {
  await requireAdmin();
  await db.$transaction(
    orderedIds.map((id, index) => db.module.update({ where: { id }, data: { order: index } }))
  );
  revalidatePath("/admin/modules");
  revalidatePath("/");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const chatModel = String(formData.get("chatModel") ?? "");
  const allowed = new Set(CHAT_MODEL_OPTIONS.map((o) => o.id));
  if (!allowed.has(chatModel as (typeof CHAT_MODEL_OPTIONS)[number]["id"])) {
    redirect(`/admin/settings?error=${encodeURIComponent("Буруу модель сонголт")}`);
  }

  await db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", chatModel },
    update: { chatModel },
  });

  revalidatePath("/admin/settings");
}
