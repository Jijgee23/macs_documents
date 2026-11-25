import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

interface DocsAccess {
  unlocked?: boolean;
}

function options(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }
  return {
    password,
    cookieName: "macs_docs_access",
    // No maxAge → session cookie, same lifetime the old sessionStorage gate had.
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  };
}

/** The shared docs password. Set DOCS_PASSWORD in the environment; falls back to the legacy value. */
export function docsPassword() {
  return process.env.DOCS_PASSWORD || "macs2026";
}

export function checkDocsPassword(input: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(docsPassword());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** DAL check — call before reading/returning any docs content (layout, pages, API routes). */
export async function hasDocsAccess(): Promise<boolean> {
  const session = await getIronSession<DocsAccess>(await cookies(), options());
  return session.unlocked === true;
}

export async function grantDocsAccess() {
  const session = await getIronSession<DocsAccess>(await cookies(), options());
  session.unlocked = true;
  await session.save();
}
