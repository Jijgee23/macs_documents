"use client";

const FAVORITES_KEY = "macs-docs-favorites";
const RECENT_KEY = "macs-docs-recent";
const MAX_RECENT = 6;
const EVENT_NAME = "macs-docs-library-change";

export interface LibraryEntry {
  id: string;
  title: string;
}

function read(key: string): LibraryEntry[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key: string, entries: LibraryEntry[]) {
  try {
    localStorage.setItem(key, JSON.stringify(entries));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {}
}

export function getFavorites(): LibraryEntry[] {
  return read(FAVORITES_KEY);
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((e) => e.id === id);
}

export function toggleFavorite(entry: LibraryEntry) {
  const current = getFavorites();
  const next = current.some((e) => e.id === entry.id)
    ? current.filter((e) => e.id !== entry.id)
    : [entry, ...current];
  write(FAVORITES_KEY, next);
}

export function getRecent(): LibraryEntry[] {
  return read(RECENT_KEY);
}

export function pushRecent(entry: LibraryEntry) {
  const next = [entry, ...getRecent().filter((e) => e.id !== entry.id)].slice(0, MAX_RECENT);
  write(RECENT_KEY, next);
}

/** Subscribes to same-tab (custom event) and cross-tab (storage event) library changes. */
export function onLibraryChange(cb: () => void) {
  window.addEventListener(EVENT_NAME, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT_NAME, cb);
    window.removeEventListener("storage", cb);
  };
}
