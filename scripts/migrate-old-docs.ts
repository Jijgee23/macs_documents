/**
 * One-time migration: parses the `yi` (nav tree) and `Rl` (id -> {t,b} markdown content)
 * literals out of the legacy bundled SPA at .old_html_project/index.html and seeds them
 * into Postgres via Prisma. Safe to re-run (upserts); module ids are derived from their
 * position in `yi`, so re-running only makes sense while the source file is unchanged.
 *
 * Usage: npx tsx scripts/migrate-old-docs.ts
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

interface NavItem {
  id: string;
  l: string;
  ch?: NavItem[];
}
interface NavModule {
  sec: string;
  items: NavItem[];
}
interface ContentEntry {
  t: string;
  b: string;
}

/** Extracts the balanced [...] or {...} substring starting at `openIdx`, ignoring
 * brackets that appear inside string/template literals in the source. */
function extractBalanced(src: string, openIdx: number): string {
  const openChar = src[openIdx];
  const closeChar = openChar === "[" ? "]" : "}";
  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;

  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (ch === "\\") {
        i++; // skip escaped char
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) return src.slice(openIdx, i + 1);
    }
  }
  throw new Error(`Unbalanced ${openChar}${closeChar} while extracting from index ${openIdx}`);
}

function extractLiteral<T>(html: string, varMarker: string, openChar: "[" | "{"): T {
  const markerIdx = html.indexOf(varMarker);
  if (markerIdx === -1) throw new Error(`Could not find \`${varMarker}\` in source file`);
  const openIdx = html.indexOf(openChar, markerIdx);
  const literalSrc = extractBalanced(html, openIdx);
  return new Function(`"use strict"; return (${literalSrc});`)() as T;
}

async function main() {
  const htmlPath = join(process.cwd(), ".old_html_project", "index.html");
  const html = readFileSync(htmlPath, "utf-8");

  const yi = extractLiteral<NavModule[]>(html, "yi=[", "[");
  const Rl = extractLiteral<Record<string, ContentEntry>>(html, "Rl={", "{");

  console.log(`Parsed ${yi.length} modules, ${Object.keys(Rl).length} content entries from source.`);

  let totalSections = 0;
  let sectionsWithBody = 0;

  for (let mIdx = 0; mIdx < yi.length; mIdx++) {
    const mod = yi[mIdx];
    const moduleId = `module-${mIdx}`;
    const moduleRow = await db.module.upsert({
      where: { id: moduleId },
      create: { id: moduleId, title: mod.sec, order: mIdx },
      update: { title: mod.sec, order: mIdx },
    });

    for (let iIdx = 0; iIdx < mod.items.length; iIdx++) {
      const item = mod.items[iIdx];
      const content = Rl[item.id];

      await db.section.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          title: content?.t ?? item.l,
          body: content?.b ?? null,
          order: iIdx,
          moduleId: moduleRow.id,
          parentId: null,
        },
        update: {
          title: content?.t ?? item.l,
          body: content?.b ?? null,
          order: iIdx,
          moduleId: moduleRow.id,
          parentId: null,
        },
      });
      totalSections++;
      if (content?.b) sectionsWithBody++;

      for (let cIdx = 0; cIdx < (item.ch?.length ?? 0); cIdx++) {
        const child = item.ch![cIdx];
        const childContent = Rl[child.id];

        await db.section.upsert({
          where: { id: child.id },
          create: {
            id: child.id,
            title: childContent?.t ?? child.l,
            body: childContent?.b ?? null,
            order: cIdx,
            moduleId: moduleRow.id,
            parentId: item.id,
          },
          update: {
            title: childContent?.t ?? child.l,
            body: childContent?.b ?? null,
            order: cIdx,
            moduleId: moduleRow.id,
            parentId: item.id,
          },
        });
        totalSections++;
        if (childContent?.b) sectionsWithBody++;
      }
    }
  }

  console.log(`Done. Upserted ${yi.length} modules and ${totalSections} sections (${sectionsWithBody} with body).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
