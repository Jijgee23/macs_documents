import "server-only";
import { db } from "@/lib/db";
import type Anthropic from "@anthropic-ai/sdk";

/** Iterative Levenshtein distance (O(min(m,n)) memory). Used to tolerate typos when
 * matching query words against document tokens. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** How many edits ("үсгийн алдаа") we forgive for a word of this length. */
function fuzzyTolerance(len: number): number {
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  return 2;
}

function fuzzyIncludes(tokens: Set<string>, word: string): boolean {
  const tolerance = fuzzyTolerance(word.length);
  if (tolerance === 0) return false;
  for (const token of tokens) {
    if (Math.abs(token.length - word.length) > tolerance) continue;
    if (levenshtein(token, word) <= tolerance) return true;
  }
  return false;
}

const WORD_SPLIT_RE = /[^a-zа-яөүёa-z0-9]+/i;

/** Uses a fast/cheap model to rewrite a possibly misspelled, colloquial, abbreviated, or
 * Latin-transliterated Mongolian message into formal Cyrillic search keywords (including
 * synonyms), so retrieval below isn't limited to literal substring matches. Falls back to
 * an empty list (retrieval just uses the raw query) if the call fails for any reason. */
export async function expandSearchTerms(client: Anthropic, query: string): Promise<string[]> {
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 60,
      system:
        "Чи бол монгол хэлний хайлтын түлхүүр үг гаргах туслах. Хэрэглэгчийн зурвас нь товчилсон, " +
        "ярианы хэллэг, галиг (латин үсгээр бичсэн монгол), эсвэл алдаатай бичигдсэн байж болно. " +
        "Агуулгыг ойлгоод, албан ёсны монгол кирилл үсгээр 3-6 хайлтын түлхүүр үг/хэллэг гарга " +
        "(ижил утгатай үгсийг мөн оруул). Зөвхөн түлхүүр үгсийг зайгаар тусгаарлан бич, өөр юу ч бүү нэм.",
      messages: [{ role: "user", content: query }],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join(" ");
    return text
      .toLowerCase()
      .split(WORD_SPLIT_RE)
      .filter((w) => w.length > 1);
  } catch (err) {
    console.error("expandSearchTerms failed, falling back to raw query:", err);
    return [];
  }
}

/** Shows the model the actual section titles and asks it to pick the ones relevant to the
 * query. Unlike `expandSearchTerms` (which only rewrites the query in isolation), this can
 * catch matches where the query and the document use unrelated wording for the same topic
 * (e.g. "ажилтан бүртгэх" query → "Ажилтны анкет" section — no shared word, but the model
 * can see the title and recognize the connection). Falls back to an empty list on error. */
export async function selectRelevantSectionIds(
  client: Anthropic,
  query: string,
  sections: { id: string; title: string }[]
): Promise<string[]> {
  if (sections.length === 0) return [];
  const listing = sections.map((s, i) => `${i + 1}. ${s.title}`).join("\n");
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 40,
      system:
        "Чи бол баримт бичгийн сангаас хэрэглэгчийн асуултад хамгийн холбогдох гарчгуудыг сонгох туслах. " +
        "Хэрэглэгчийн асуулт нь товчилсон, ярианы хэллэг, галиг (латин үсгээр бичсэн монгол), эсвэл " +
        "алдаатай байж болно — утга, сэдвийг нь ойлгож (үг шууд давхцаагүй ч сэдвээрээ хамааралтай " +
        "байж болно), доорх дугаарлагдсан гарчгуудаас хамгийн холбогдох 1-4-ийг сонго. Зөвхөн " +
        "дугааруудыг зайгаар тусгаарлан бич (жишээ: \"3 17\"). Юу ч тохирохгүй бол \"0\" гэж бич.",
      messages: [{ role: "user", content: `Гарчгийн жагсаалт:\n${listing}\n\nАсуулт: ${query}` }],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join(" ");
    const ids: string[] = [];
    for (const match of text.matchAll(/\d+/g)) {
      const section = sections[parseInt(match[0], 10) - 1];
      if (section && !ids.includes(section.id)) ids.push(section.id);
    }
    return ids;
  } catch (err) {
    console.error("selectRelevantSectionIds failed:", err);
    return [];
  }
}

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
 * enough corpus (~200 rows) that scoring in JS beats standing up Postgres full-text search.
 * Exact substrings score highest; near-misses (typos, within `fuzzyTolerance` edits of a
 * document token) still score, just lower.
 *
 * When `client` is given, this also runs `expandSearchTerms` (query → synonyms/typo-fixed
 * keywords) and `selectRelevantSectionIds` (title list → semantically relevant picks) in
 * parallel, and folds both signals in: expanded terms feed the same word-overlap scoring,
 * and LLM-picked sections get a large score boost so they surface even with zero shared
 * words with the query (e.g. "ажилтан бүртгэх" → "Ажилтны анкет"). */
export async function getRagContext(query: string, limit = 4, client?: Anthropic): Promise<RagMatch[]> {
  const sections = await db.section.findMany({
    where: { body: { not: null } },
    select: { id: true, title: true, body: true },
  });

  const [extraTerms, boostedIds] = client
    ? await Promise.all([
        expandSearchTerms(client, query),
        selectRelevantSectionIds(client, query, sections),
      ])
    : [[] as string[], [] as string[]];
  const boosted = new Set(boostedIds);

  const rawWords = query
    .toLowerCase()
    .split(WORD_SPLIT_RE)
    .filter((w) => w.length > 1);
  const words = Array.from(new Set([...rawWords, ...extraTerms]));

  const scored = sections
    .map((s) => {
      const titleLower = s.title.toLowerCase();
      const bodyLower = (s.body ?? "").toLowerCase();
      const titleTokens = new Set(titleLower.split(WORD_SPLIT_RE).filter(Boolean));
      const bodyTokens = new Set(bodyLower.split(WORD_SPLIT_RE).filter(Boolean));

      let score = boosted.has(s.id) ? 10 : 0;
      for (const w of words) {
        if (titleLower.includes(w)) score += 3;
        else if (fuzzyIncludes(titleTokens, w)) score += 2;

        if (bodyLower.includes(w)) score += 1;
        else if (fuzzyIncludes(bodyTokens, w)) score += 0.5;
      }
      return { id: s.id, title: s.title, body: s.body ?? "", score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ id, title, body }) => ({ id, title, body }));
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
