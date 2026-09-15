import { useEffect, useState } from "react";
import type { Browser } from "wxt/browser";
import { i18n } from "#i18n";
import { browser } from "@/lib/browser";
import type { Session, TabNote } from "@/lib/types";
import { FREE_NOTE_LIMIT } from "@/lib/types";
import {
  deleteNote,
  deleteSession,
  getNoteForUrl,
  getNotes,
  getPremium,
  getSessions,
  saveNote,
  saveSession,
  searchNotes,
  updateSessionTabs,
} from "@/lib/storage";
import { focusOrOpenTab } from "@/lib/tabs";

type View = "notes" | "sessions";

const t = i18n.t;

export default function App() {
  const [view, setView] = useState<View>("notes");
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<TabNote[]>([]);
  const [total, setTotal] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentTab, setCurrentTab] = useState<Browser.tabs.Tab | null>(null);
  const [draft, setDraft] = useState("");
  const [premium, setPremiumState] = useState(false);
  const [hitLimit, setHitLimit] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  /** URL of the note currently being edited inline, plus its working copy. */
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    void refresh();
    // The side panel stays mounted across tab switches, so re-read the active
    // tab whenever it changes rather than only on mount.
    const onActivated = () => void refresh();
    browser.tabs.onActivated.addListener(onActivated);
    browser.tabs.onUpdated.addListener(onActivated);
    return () => {
      browser.tabs.onActivated.removeListener(onActivated);
      browser.tabs.onUpdated.removeListener(onActivated);
    };
  }, []);

  useEffect(() => {
    void loadNotes(query);
  }, [query]);

  async function refresh() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    setCurrentTab(tab ?? null);
    setPremiumState(await getPremium());
    setSessions(await getSessions());
    await loadNotes(query);

    if (tab?.url) {
      const existing = await getNoteForUrl(tab.url);
      setDraft(existing?.note ?? "");
      setHitLimit(false);
    }
  }

  async function loadNotes(q: string) {
    const all = await getNotes();
    setTotal(Object.keys(all).length);
    setNotes(await searchNotes(q));
  }

  async function handleSave() {
    if (!currentTab?.url) return;
    const result = await saveNote({
      url: currentTab.url,
      title: currentTab.title ?? currentTab.url,
      favIconUrl: currentTab.favIconUrl,
      note: draft,
      tabId: currentTab.id,
    });
    if (!result.ok) {
      setHitLimit(true);
      return;
    }
    setHitLimit(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
    await loadNotes(query);
  }

  async function handleDelete(url: string) {
    await deleteNote(url);
    if (currentTab?.url) {
      const existing = await getNoteForUrl(currentTab.url);
      setDraft(existing?.note ?? "");
    }
    await loadNotes(query);
  }

  async function handleOpen(note: TabNote) {
    await focusOrOpenTab(note.url);
    await refresh();
  }

  function startEditing(note: TabNote, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingUrl(note.url);
    setEditDraft(note.note);
  }

  async function commitEdit(note: TabNote) {
    await saveNote({
      url: note.url,
      title: note.title,
      favIconUrl: note.favIconUrl,
      note: editDraft,
      tags: note.tags,
      starred: note.starred,
    });
    setEditingUrl(null);
    await loadNotes(query);
    // Keep the composer in sync if the edited note is the page we're on.
    if (currentTab?.url && note.url === currentTab.url) {
      setDraft(editDraft);
    }
  }

  async function handleStar(note: TabNote, e: React.MouseEvent) {
    e.stopPropagation();
    await saveNote({
      url: note.url,
      title: note.title,
      favIconUrl: note.favIconUrl,
      note: note.note,
      tags: note.tags,
      starred: !note.starred,
    });
    await loadNotes(query);
  }

  async function handleSaveSession() {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const name = new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    await saveSession(
      name,
      tabs
        .filter((t) => t.url && !t.url.startsWith("chrome://"))
        .map((t) => ({ url: t.url!, title: t.title ?? t.url!, favIconUrl: t.favIconUrl })),
    );
    setSessions(await getSessions());
  }

  async function handleRestore(session: Session) {
    for (const tab of session.tabs) {
      await browser.tabs.create({ url: tab.url, active: false });
    }
  }

  async function handleRestoreOne(url: string) {
    await focusOrOpenTab(url);
    await refresh();
  }

  async function handleRemoveFromSession(session: Session, index: number) {
    const next = session.tabs.filter((_, i) => i !== index);
    if (next.length === 0) {
      await deleteSession(session.id);
      setExpandedSession(null);
    } else {
      setSessions(await updateSessionTabs(session.id, next));
    }
  }

  async function handleAddCurrentToSession(session: Session) {
    if (!currentTab?.url || currentTab.url.startsWith("chrome://")) return;
    const already = session.tabs.some((t) => t.url === currentTab.url);
    if (already) return;
    const next = [
      ...session.tabs,
      {
        url: currentTab.url,
        title: currentTab.title ?? currentTab.url,
        favIconUrl: currentTab.favIconUrl,
      },
    ];
    setSessions(await updateSessionTabs(session.id, next));
  }

  async function handleDeleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteSession(id);
    setSessions(await getSessions());
  }

  const atLimit = !premium && total >= FREE_NOTE_LIMIT;

  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <span className="brand-name">TabNotes</span>
          <span className={`counter ${atLimit ? "at-limit" : ""}`}>
            {premium
              ? t("noteCount", { count: total })
              : t("noteCountLimit", { count: total, limit: FREE_NOTE_LIMIT })}
          </span>
        </div>
        <div className="tabs-row">
          <button
            className={`tab-btn ${view === "notes" ? "active" : ""}`}
            onClick={() => setView("notes")}
          >
            {t("tabNotes")}
          </button>
          <button
            className={`tab-btn ${view === "sessions" ? "active" : ""}`}
            onClick={() => setView("sessions")}
          >
            {t("sessions")}
          </button>
        </div>
      </div>

      {view === "notes" ? (
        <>
          <div className="search">
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="list">
            {notes.length === 0 ? (
              <div className="empty">
                {query ? t("emptyNoMatch") : t("emptyNoNotes")}
              </div>
            ) : (
              notes.map((n) => {
                const isEditing = editingUrl === n.url;
                return (
                <div
                  key={n.url}
                  className={`card ${isEditing ? "" : "clickable"} ${currentTab?.url && n.url === currentTab.url ? "current" : ""}`}
                  onClick={() => {
                    if (!isEditing) void handleOpen(n);
                  }}
                  title={isEditing ? undefined : t("openPage")}
                >
                  <div className="card-head">
                    {n.favIconUrl ? (
                      <img className="favicon" src={n.favIconUrl} alt="" />
                    ) : null}
                    <span className="card-title">{n.title}</span>
                    {currentTab?.url && n.url === currentTab.url ? (
                      <span className="badge-current">{t("badgeNow")}</span>
                    ) : null}
                  </div>

                  {isEditing ? (
                    <>
                      <textarea
                        className="card-edit"
                        value={editDraft}
                        autoFocus
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            void commitEdit(n);
                          }
                          if (e.key === "Escape") setEditingUrl(null);
                        }}
                      />
                      <div className="card-edit-actions">
                        <button className="btn primary" onClick={() => void commitEdit(n)}>
                          {t("saveEdit")}
                        </button>
                        <button className="btn" onClick={() => setEditingUrl(null)}>
                          {t("cancel")}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="card-note">{n.note}</div>
                  )}

                  <div className="card-foot">
                    {n.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                    <button
                      className="icon-btn open"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleOpen(n);
                      }}
                      title={t("openPage")}
                    >
                      ↗
                    </button>
                    <button
                      className="icon-btn"
                      onClick={(e) => startEditing(n, e)}
                      title={t("edit")}
                    >
                      ✎
                    </button>
                    <button
                      className={`icon-btn ${n.starred ? "starred" : ""}`}
                      onClick={(e) => handleStar(n, e)}
                      title={t("star")}
                    >
                      ★
                    </button>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(n.url);
                      }}
                      title={t("delete")}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>

          <div className="editor">
            <div className="editor-title">
              {currentTab?.title ?? t("noActiveTab")}
            </div>
            <textarea
              placeholder={t("textareaPlaceholder")}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter saves; Shift+Enter inserts a newline for multi-line notes.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (currentTab?.url && draft.trim()) void handleSave();
                }
              }}
              disabled={!currentTab?.url}
            />
            <div className="editor-actions">
              <button
                className={`btn primary save ${justSaved ? "saved" : ""}`}
                onClick={() => void handleSave()}
                disabled={!currentTab?.url || !draft.trim()}
              >
                {justSaved ? t("saved") : t("saveNote")}
              </button>
            </div>
            <div className="editor-hint">{t("saveHint")}</div>
            {hitLimit ? (
              <div className="notice">
                {t("limitReached", { limit: FREE_NOTE_LIMIT })}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="list" style={{ paddingTop: 14 }}>
          <button className="btn" style={{ width: "100%", marginBottom: 10 }} onClick={() => void handleSaveSession()}>
            {t("saveSession")}
          </button>
          {sessions.length === 0 ? (
            <div className="empty">{t("emptyNoSessions")}</div>
          ) : (
            sessions.map((s) => {
              const isOpen = expandedSession === s.id;
              return (
                <div key={s.id} className={`card ${isOpen ? "expanded" : ""}`}>
                  <div
                    className="card-head"
                    onClick={() => setExpandedSession(isOpen ? null : s.id)}
                  >
                    <span className="chevron">{isOpen ? "▾" : "▸"}</span>
                    <span className="card-title">{s.name}</span>
                    <span className="counter">{t("tabsCount", { count: s.tabs.length })}</span>
                  </div>

                  {isOpen ? (
                    <>
                      <div className="session-tabs">
                        {s.tabs.map((tab, i) => (
                          <div
                            key={`${s.id}-${i}`}
                            className="session-tab"
                            onClick={() => void handleRestoreOne(tab.url)}
                            title={t("openPage")}
                          >
                            {tab.favIconUrl ? (
                              <img className="favicon" src={tab.favIconUrl} alt="" />
                            ) : null}
                            <span className="session-tab-title">
                              {tab.title || tab.url}
                            </span>
                            <button
                              className="icon-btn tiny"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleRemoveFromSession(s, i);
                              }}
                              title={t("removeFromSession")}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        className="btn add-current"
                        onClick={() => void handleAddCurrentToSession(s)}
                        disabled={
                          !currentTab?.url ||
                          currentTab.url.startsWith("chrome://") ||
                          s.tabs.some((tab) => tab.url === currentTab.url)
                        }
                      >
                        ＋ {t("addCurrentTab")}
                      </button>

                      <div className="session-actions">
                        <button
                          className="btn"
                          onClick={() => void handleRestore(s)}
                        >
                          {t("restoreAll")}
                        </button>
                        <button
                          className="btn danger"
                          onClick={(e) => void handleDeleteSession(s.id, e)}
                          title={t("deleteSession")}
                        >
                          {t("delete")}
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
