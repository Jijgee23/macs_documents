import "server-only";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * Quote requests and contact messages submitted from macs.mn. macs.mn has no
 * database: its Server Actions POST here (app/api/site/*) with SITE_API_KEY.
 * Error codes and option ids must stay in sync with macs.mn/content/common.ts.
 */

export const QUOTE_PRODUCTS: Record<string, string> = {
  "macs-erp": "MACS ERP",
  macsxe4: "MacsXE4",
  "macs-pos": "MACS POS",
  "restaurant-pos": "Рестораны POS",
  "pharmacy-pos": "Эмийн сангийн POS",
  "hr-payroll": "Хүний нөөц, цалин",
  other: "Бусад систем",
};

export const CONTACT_TOPICS: Record<string, string> = {
  general: "Ерөнхий асуулт",
  feedback: "Санал хүсэлт",
  support: "Техникийн дэмжлэг",
  partnership: "Хамтын ажиллагаа",
  other: "Бусад",
};

export const productLabel = (id: string) => QUOTE_PRODUCTS[id] ?? id;
export const topicLabel = (id: string) => CONTACT_TOPICS[id] ?? id;

export type ErrorCode = "required" | "invalidEmail" | "invalidPhone" | "tooLong" | "rateLimited";

export type InquiryResult =
  | { ok: true }
  | { ok: false; status: 400 | 429; errors?: Record<string, ErrorCode[]>; error?: ErrorCode };

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

const code = (c: ErrorCode) => c;
const text = z.string().catch("");

const optionalText = (max: number) =>
  text.pipe(z.string().trim().max(max, code("tooLong"))).transform((v) => v || null);
const requiredText = (max: number) =>
  text.pipe(z.string().trim().min(1, code("required")).max(max, code("tooLong")));
const email = text.pipe(z.string().trim().toLowerCase().pipe(z.email(code("invalidEmail"))));

const isPhone = (v: string) => {
  const digits = v.replace(/\D/g, "").length;
  return /^[+\d][\d\s-]*$/.test(v) && digits >= 8 && digits <= 15;
};
const phone = text.pipe(z.string().trim().refine(isPhone, code("invalidPhone")));
const optionalPhone = text
  .pipe(z.string().trim().refine((v) => v === "" || isPhone(v), code("invalidPhone")))
  .transform((v) => v || null);

/** Fields every request carries besides the form itself. */
const meta = {
  lang: z.enum(["mn", "en"]).catch("mn"),
  ip: z.string().max(64).nullish().catch(null),
};

const quoteSchema = z.object({
  ...meta,
  email,
  phone,
  name: optionalText(120),
  company: optionalText(200),
  message: optionalText(2000),
  products: z
    .array(z.enum(Object.keys(QUOTE_PRODUCTS) as [string, ...string[]]))
    .max(Object.keys(QUOTE_PRODUCTS).length)
    .catch([]),
});

const contactSchema = z.object({
  ...meta,
  name: optionalText(120),
  email,
  phone: optionalPhone,
  topic: z.enum(Object.keys(CONTACT_TOPICS) as [string, ...string[]]).catch("general"),
  message: requiredText(4000),
});

function invalid(error: z.ZodError): InquiryResult {
  return {
    ok: false,
    status: 400,
    errors: z.flattenError(error).fieldErrors as Record<string, ErrorCode[]>,
  };
}

const since = () => new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
const rateLimited: InquiryResult = { ok: false, status: 429, error: "rateLimited" };

export async function createQuote(input: unknown) {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { result: invalid(parsed.error) };

  const { lang, ip, ...data } = parsed.data;
  if (ip && (await db.quoteRequest.count({ where: { ip, createdAt: { gte: since() } } })) >= RATE_LIMIT_MAX) {
    return { result: rateLimited };
  }
  const record = await db.quoteRequest.create({ data: { ...data, locale: lang, ip: ip ?? null } });
  return { result: { ok: true } as InquiryResult, record };
}

export async function createContact(input: unknown) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { result: invalid(parsed.error) };

  const { lang, ip, ...data } = parsed.data;
  if (ip && (await db.contactMessage.count({ where: { ip, createdAt: { gte: since() } } })) >= RATE_LIMIT_MAX) {
    return { result: rateLimited };
  }
  const record = await db.contactMessage.create({ data: { ...data, locale: lang, ip: ip ?? null } });
  return { result: { ok: true } as InquiryResult, record };
}

/** Checks `Authorization: Bearer <SITE_API_KEY>`; fails closed when the key isn't configured. */
export function isAuthorizedSite(request: Request) {
  const expected = process.env.SITE_API_KEY;
  if (!expected || expected.length < 32) return false;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
