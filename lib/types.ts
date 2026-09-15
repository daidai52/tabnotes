export interface TabNote {
  /** Chrome tab id at the time the note was written. Reused after tab closes. */
  tabId?: number;
  /** Canonical URL. Notes survive the tab closing, so this is the durable key. */
  url: string;
  title: string;
  favIconUrl?: string;
  note: string;
  tags: string[];
  /** Pinned notes are exempt from the free-tier limit. */
  starred: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id: string;
  name: string;
  tabs: { url: string; title: string; favIconUrl?: string }[];
  createdAt: number;
}

export const FREE_NOTE_LIMIT = 50;
