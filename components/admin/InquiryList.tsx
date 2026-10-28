import Link from "next/link";
import type { ReactNode } from "react";
import type { RequestStatus } from "@prisma/client";
import { updateInquiryAction } from "@/lib/actions";
import { Select } from "@/components/admin/Select";
import { cardStyle, fieldStyle, linkStyle, mutedStyle, primaryButtonStyle } from "@/components/admin/styles";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "Шинэ",
  CONTACTED: "Холбогдсон",
  CLOSED: "Хаасан",
};

const STATUS_COLORS: Record<RequestStatus, { background: string; color: string }> = {
  NEW: { background: "var(--brd-l)", color: "var(--brd)" },
  CONTACTED: { background: "var(--ai-l)", color: "var(--ai)" },
  CLOSED: { background: "var(--hv)", color: "var(--mu)" },
};

const statuses = Object.keys(STATUS_LABELS) as RequestStatus[];

const dateFormat = new Intl.DateTimeFormat("mn-MN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ulaanbaatar",
});

export function parseStatus(value: unknown): RequestStatus | undefined {
  return typeof value === "string" && value in STATUS_LABELS ? (value as RequestStatus) : undefined;
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export function StatusFilter({
  basePath,
  filter,
  counts,
}: {
  basePath: string;
  filter?: RequestStatus;
  counts: { status: RequestStatus; _count: number }[];
}) {
  const countOf = (s: RequestStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const tabs = [
    { label: "Бүгд", href: basePath, active: !filter, count: counts.reduce((sum, c) => sum + c._count, 0) },
    ...statuses.map((s) => ({
      label: STATUS_LABELS[s],
      href: `${basePath}?status=${s}`,
      active: filter === s,
      count: countOf(s),
    })),
  ];

  return (
    <nav className="mb-5 flex flex-wrap gap-2 text-[13px]" aria-label="Төлөвөөр шүүх">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="rounded-full px-3 py-1"
          style={
            t.active
              ? { background: "var(--brd-l)", color: "var(--brd)", border: "1px solid var(--brd-b)" }
              : { color: "var(--mu)", border: "1px solid var(--br)" }
          }
        >
          {t.label} <span style={{ opacity: 0.7 }}>{t.count}</span>
        </Link>
      ))}
    </nav>
  );
}

type Item = { id: string; status: RequestStatus; note: string | null; locale: string; createdAt: Date };

export function InquiryCard({
  kind,
  item,
  title,
  subtitle,
  children,
}: {
  kind: "quote" | "contact";
  item: Item;
  title: string;
  subtitle?: string | null;
  children: ReactNode;
}) {
  return (
    <li className="p-4" style={cardStyle}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          {subtitle && (
            <p className="text-[13px]" style={mutedStyle}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {item.locale === "en" && (
            <span className="rounded px-1.5 py-0.5 font-semibold" style={{ background: "var(--tx)", color: "var(--bg)" }}>
              EN — англиар хариулна
            </span>
          )}
          <span className="rounded-full px-2.5 py-0.5 font-medium" style={STATUS_COLORS[item.status]}>
            {STATUS_LABELS[item.status]}
          </span>
          <time style={mutedStyle} dateTime={item.createdAt.toISOString()}>
            {dateFormat.format(item.createdAt)}
          </time>
        </div>
      </div>

      {children}

      <form
        action={updateInquiryAction}
        className="mt-3 flex flex-col gap-2 pt-3 sm:flex-row"
        style={{ borderTop: "1px solid var(--br)" }}
      >
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={item.id} />
        <Select name="status" defaultValue={item.status} aria-label="Төлөв" className="sm:w-40">
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <input
          name="note"
          defaultValue={item.note ?? ""}
          placeholder="Тэмдэглэл (хэн холбогдсон, юу ярилцсан…)"
          aria-label="Тэмдэглэл"
          className="flex-1 px-3 py-2 text-sm outline-none"
          style={fieldStyle}
        />
        <button type="submit" className="px-4 py-2 text-sm font-medium" style={primaryButtonStyle}>
          Хадгалах
        </button>
      </form>
    </li>
  );
}

export function ContactLinks({ email, phone }: { email: string; phone?: string | null }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
      <a href={`mailto:${email}`} className="hover:underline" style={linkStyle}>
        {email}
      </a>
      {phone && (
        <a href={telHref(phone)} className="hover:underline" style={linkStyle}>
          {phone}
        </a>
      )}
    </div>
  );
}
