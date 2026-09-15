import type { Session, TabNote } from "./types";
import { FREE_NOTE_LIMIT } from "./types";

/**
 * All data lives in chrome.storage.local — no backend, no account, no per-use
 * cost. Keys are prefixed so a single storage area can hold both collections.
 */
const NOTES_KEY = "tabnotes:notes";
const SESSIONS_KEY = "tabnotes:sessions";
const PREMIUM_KEY = "tabnotes:premium";

/** Notes are keyed by URL so they outlive the tab that created them. */
function noteKey(url: string): string {
  try {
    const u = new URL(url);
    // Strip the hash and tracking params so the same page maps to one note.
    u.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
      (p) => u.searchParams.delete(p),
    );
    return u.toString();
  } catch {
    return url;
  }
}

export async function getNotes(): Promise<Record<string, TabNote>> {
  const raw = await chrome.storage.local.get(NOTES_KEY);
  return (raw[NOTES_KEY] as Record<string, TabNote>) ?? {};
}

export async function getNoteForUrl(url: string): Promise<TabNote | null> {
  const notes = await getNotes();
  return notes[noteKey(url)] ?? null;
}

export async function saveNote(
  input: Pick<TabNote, "url" | "title" | "favIconUrl" | "note"> &
    Partial<Pick<TabNote, "tags" | "starred" | "tabId">>,
): Promise<{ ok: true; note: TabNote } | { ok: false; reason: "limit" }> {
  const notes = await getNotes();
  const key = noteKey(input.url);
  const existing = notes[key];
  const now = Date.now();

  if (!existing) {
    const isPremium = await getPremium();
    if (!isPremium && Object.keys(notes).length >= FREE_NOTE_LIMIT) {
      return { ok: false, reason: "limit" };
    }
  }

  const note: TabNote = {
    url: key,
    title: input.title || existing?.title || key,
    favIconUrl: input.favIconUrl ?? existing?.favIconUrl,
    note: input.note,
    tags: input.tags ?? existing?.tags ?? [],
    starred: input.starred ?? existing?.starred ?? false,
    tabId: input.tabId ?? existing?.tabId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  notes[key] = note;
  await chrome.storage.local.set({ [NOTES_KEY]: notes });
  return { ok: true, note };
}

export async function deleteNote(url: string): Promise<void> {
  const notes = await getNotes();
  delete notes[noteKey(url)];
  await chrome.storage.local.set({ [NOTES_KEY]: notes });
}

export async function searchNotes(query: string): Promise<TabNote[]> {
  const notes = await getNotes();
  const all = Object.values(notes);
  const q = query.trim().toLowerCase();
  if (!q) return all.sort((a, b) => b.updatedAt - a.updatedAt);

  return all
    .filter(
      (n) =>
        n.note.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.url.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getSessions(): Promise<Session[]> {
  const raw = await chrome.storage.local.get(SESSIONS_KEY);
  return (raw[SESSIONS_KEY] as Session[]) ?? [];
}

export async function saveSession(name: string, tabs: Session["tabs"]): Promise<Session> {
  const sessions = await getSessions();
  const session: Session = {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    tabs,
    createdAt: Date.now(),
  };
  sessions.unshift(session);
  await chrome.storage.local.set({ [SESSIONS_KEY]: sessions });
  return session;
}

export async function updateSessionTabs(
  id: string,
  tabs: Session["tabs"],
): Promise<Session[]> {
  const sessions = await getSessions();
  const next = sessions.map((s) => (s.id === id ? { ...s, tabs } : s));
  await chrome.storage.local.set({ [SESSIONS_KEY]: next });
  return next;
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = await getSessions();
  await chrome.storage.local.set({
    [SESSIONS_KEY]: sessions.filter((s) => s.id !== id),
  });
}

export async function getPremium(): Promise<boolean> {
  const raw = await chrome.storage.local.get(PREMIUM_KEY);
  return Boolean(raw[PREMIUM_KEY]);
}

export async function setPremium(value: boolean): Promise<void> {
  await chrome.storage.local.set({ [PREMIUM_KEY]: value });
}

export { noteKey };
