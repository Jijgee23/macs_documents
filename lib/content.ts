import "server-only";
import { db } from "@/lib/db";

export async function getNavTree() {
  return db.module.findMany({
    orderBy: { order: "asc" },
    include: {
      sections: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          children: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

export interface RagMatch {
  id: string;
  title: string;
  body: string;
}

/** Word-overlap scoring (title matches weigh 3x) over all sections with content — small
 * enough corpus (~200 rows) that scoring in JS beats standing up Postgres full-text search. */
export async function getRagContext(query: string, limit = 4): Promise<RagMatch[]> {
  const words = query
    .toLowerCase()
    .split(/[^a-zа-яөүёa-z0-9]+/i)
    .filter((w) => w.length > 1);
  if (words.length === 0) return [];

  const sections = await db.section.findMany({
    where: { body: { not: null } },
    select: { id: true, title: true, body: true },
  });

  return sections
    .map((s) => {
      const titleLower = s.title.toLowerCase();
      const bodyLower = (s.body ?? "").toLowerCase();
      let score = 0;
      for (const w of words) {
        if (titleLower.includes(w)) score += 3;
        if (bodyLower.includes(w)) score += 1;
      }
      return { id: s.id, title: s.title, body: s.body ?? "", score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, title, body }) => ({ id, title, body }));
}

export interface FlatNavEntry {
  id: string;
  title: string;
}

export async function getPrevNext(id: string): Promise<{ prev: FlatNavEntry | null; next: FlatNavEntry | null }> {
  const modules = await getNavTree();
  const flat: FlatNavEntry[] = [];

  for (const m of modules) {
    for (const s of m.sections) {
      flat.push({ id: s.id, title: s.title });
      for (const c of s.children) {
        flat.push({ id: c.id, title: c.title });
      }
    }
  }

  const idx = flat.findIndex((entry) => entry.id === id);
  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}

export async function getSection(id: string) {
  return db.section.findUnique({
    where: { id },
    include: {
      module: true,
      parent: true,
      children: { orderBy: { order: "asc" } },
    },
  });
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string | null;
  moduleTitle: string;
}

/** Title matches are weighted 3x over body-only matches, mirroring the original SPA's search. */
export async function searchSections(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const matches = await db.section.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { module: true },
  });

  const lowerQ = q.toLowerCase();

  return matches
    .map((s) => {
      const titleMatch = s.title.toLowerCase().includes(lowerQ);
      let snippet: string | null = null;
      if (!titleMatch && s.body) {
        const idx = s.body.toLowerCase().indexOf(lowerQ);
        if (idx > -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(s.body.length, idx + q.length + 60);
          snippet = s.body.slice(start, end).replace(/\s+/g, " ").trim();
        }
      }
      return {
        id: s.id,
        title: s.title,
        snippet,
        moduleTitle: s.module.title,
        score: titleMatch ? 3 : 1,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ id, title, snippet, moduleTitle }) => ({ id, title, snippet, moduleTitle }));
}
