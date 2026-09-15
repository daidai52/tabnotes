/**
 * Generates the 1280x800 store screenshots.
 *
 * The panel markup below mirrors the real App.tsx DOM and pulls in the real
 * style.css via a relative <link>, so the screenshots show the shipping UI
 * rather than a redrawn approximation.
 */
const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const PANEL_W = 460;

/* ---------- fake site icons (inline SVG so nothing is fetched) ---------- */
const tile = (letter, bg) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><text x="16" y="22" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  );

const ICONS = {
  acme: tile("A", "#e0593f"),
  github: tile("G", "#24292f"),
  food: tile("R", "#c98a2e"),
  hn: tile("Y", "#ff6600"),
  figma: tile("F", "#a259ff"),
  docs: tile("D", "#4285f4"),
  stack: tile("S", "#f48024"),
};

/* ---------- panel fragments ---------- */

function card({ icon, title, note, current, starred, showEdit }) {
  const body = showEdit
    ? `<textarea class="card-edit">${note}</textarea>
       <div class="card-edit-actions">
         <button class="btn primary">Save</button>
         <button class="btn">Cancel</button>
       </div>`
    : `<div class="card-note">${note}</div>`;

  return `
  <div class="card ${current ? "current" : ""}">
    <div class="card-head">
      <img class="favicon" src="${icon}" alt="">
      <span class="card-title">${title}</span>
      ${current ? `<span class="badge-current">Now</span>` : ""}
    </div>
    ${body}
    <div class="card-foot">
      <button class="icon-btn open">↗</button>
      <button class="icon-btn">✎</button>
      <button class="icon-btn ${starred ? "starred" : ""}">★</button>
      <button class="icon-btn">✕</button>
    </div>
  </div>`;
}

const search = (q) => `
  <div class="search">
    <input type="search" value="${q}" placeholder="Search notes, titles, tags…">
  </div>`;

const header = (active) => `
  <div class="header">
    <div class="brand">
      <span class="brand-name">TabNotes</span>
      <span class="counter">14 / 50</span>
    </div>
    <div class="tabs-row">
      <button class="tab-btn ${active === "notes" ? "active" : ""}">Notes</button>
      <button class="tab-btn ${active === "sessions" ? "active" : ""}">Sessions</button>
    </div>
  </div>`;

const editor = (title, value, disabled) => `
  <div class="editor">
    <div class="editor-title">${title}</div>
    <textarea placeholder="Why did you open this tab? What do you need from it?">${value || ""}</textarea>
    <div class="editor-actions">
      <button class="btn primary save" ${disabled ? "disabled" : ""}>Save</button>
    </div>
    <div class="editor-hint">Enter to save · Shift+Enter for a new line</div>
  </div>`;

const NOTES = [
  {
    icon: ICONS.acme,
    title: "Competitor Pricing — Acme Corp",
    note: "competitor pricing, cite in Thursday deck",
    current: true,
    starred: true,
  },
  {
    icon: ICONS.github,
    title: "GitHub — wxt-dev/wxt",
    note: "bug repro, check again after deploy",
  },
  {
    icon: ICONS.food,
    title: "How to halve a cake recipe",
    note: "recipe — halve the sugar",
    starred: true,
  },
  {
    icon: ICONS.hn,
    title: "Hacker News — the tab hoarding thread",
    note: "the thread about tab hoarding, quote the 25-tabs stat",
  },
  {
    icon: ICONS.figma,
    title: "Figma — Dashboard v3",
    note: "hand off to Chen before Friday",
  },
  {
    icon: ICONS.docs,
    title: "Designing for the side panel",
    note: "read before building the next panel layout",
  },
];

const SESSION_TABS = [
  { icon: ICONS.stack, title: "How do I keep 40 tabs under control? — Stack Overflow" },
  { icon: ICONS.github, title: "GitHub — daidai52/tabnotes" },
  { icon: ICONS.figma, title: "Figma — Dashboard v3" },
  { icon: ICONS.docs, title: "chrome.sidePanel API reference" },
  { icon: ICONS.hn, title: "Show HN: a tab manager that remembers why" },
];

function sessionCard({ name, count, open, rows }) {
  const body = rows
    .map(
      (t) => `
      <div class="session-tab">
        <img class="favicon" src="${t.icon}" alt="">
        <span class="session-tab-title">${t.title}</span>
        <button class="icon-btn tiny${open ? " lit" : ""}">✕</button>
      </div>`,
    )
    .join("");

  return `
  <div class="card ${open ? "expanded" : ""}">
    <div class="card-head">
      <span class="chevron">${open ? "▾" : "▸"}</span>
      <span class="card-title">${name}</span>
      <span class="counter">${count} tabs</span>
    </div>
    ${
      open
        ? `<div class="session-tabs">${body}</div>
           <button class="btn add-current">＋ Add current tab</button>
           <div class="session-actions">
             <button class="btn">Open all tabs</button>
             <button class="btn danger">Delete</button>
           </div>`
        : ""
    }
  </div>`;
}

const sessionsList = `
  <div class="list" style="padding-top:14px">
    <button class="btn" style="width:100%;margin-bottom:10px">Save all tabs in this window</button>
    ${sessionCard({ name: "Sep 12, 09:14", count: SESSION_TABS.length, open: true, rows: SESSION_TABS })}
    ${sessionCard({
      name: "Sep 09, 21:40",
      count: 12,
      open: false,
      rows: SESSION_TABS.slice(0, 3),
    })}
    ${sessionCard({
      name: "Sep 04, 15:02",
      count: 31,
      open: false,
      rows: SESSION_TABS.slice(0, 3),
    })}
  </div>`;

/* ---------- the four panels ---------- */

const panelNotes = `
  ${header("notes")}
  ${search("")}
  <div class="list">${NOTES.map(card).join("")}</div>
  ${editor("Figma — Dashboard v3", "")}
`;

const panelSearch = `
  ${header("notes")}
  ${search("thursday deck")}
  <div class="list">
    ${card({
      icon: ICONS.acme,
      title: "Competitor Pricing — Acme Corp",
      note: "competitor pricing, cite in Thursday deck",
      current: true,
      starred: true,
    })}
  </div>
  ${editor("Competitor Pricing — Acme Corp", "")}
`;

const panelEdit = `
  ${header("notes")}
  ${search("")}
  <div class="list">
    ${card({
      icon: ICONS.hn,
      title: "Hacker News — the tab hoarding thread",
      note: "the thread about tab hoarding, quote the 25-tabs stat",
      showEdit: true,
    })}
    ${NOTES.slice(0, 2).map(card).join("")}
  </div>
  ${editor("Figma — Dashboard v3", "")}
`;

const panelSessions = `
  ${header("sessions")}
  ${sessionsList}
`;

/* ---------- 1280x800 composition ---------- */

function shot({ file, kicker, headline, sub, panel }) {
  const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="../entrypoints/sidepanel/style.css">
<style>
  /* The headless renderer defaults to prefers-color-scheme: light. These
     declarations come after the linked stylesheet, so they pin the panel to
     the dark theme the brand uses. */
  :root{
    --bg:#0f1115; --bg-card:#171a21; --bg-hover:#1e222b; --border:#262b36;
    --text:#e6e9ef; --text-muted:#8b93a7; --accent:#4f8cff; --accent-hover:#6ba0ff;
    --danger:#ff5c5c; --star:#ffb020; --radius:8px;
  }
  html,body{width:1280px;height:800px;overflow:hidden;margin:0}
  body{
    position:relative; color:#e8ecf4;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    background:
      radial-gradient(1100px 620px at 4% 0%, #1b2740 0%, transparent 62%),
      radial-gradient(820px 520px at 62% 108%, #1a2136 0%, transparent 58%),
      #0b0e14;
  }
  .copy{
    position:absolute; left:0; top:0; height:100%;
    width:${1280 - PANEL_W}px; box-sizing:border-box;
    padding:0 56px 0 74px;
    display:flex; flex-direction:column; justify-content:center;
  }
  .kicker{
    display:inline-block; align-self:flex-start;
    font-size:11.5px; font-weight:700; letter-spacing:.14em;
    text-transform:uppercase; color:#4f8cff; margin-bottom:20px;
    border:1px solid rgba(79,140,255,.4); border-radius:99px; padding:5px 13px;
  }
  h1{font-size:42px; line-height:1.14; letter-spacing:-.032em; margin:0 0 20px; font-weight:800}
  h1 em{font-style:normal; color:#4f8cff}
  p{font-size:16px; line-height:1.6; color:#8b95ab; margin:0; max-width:600px}

  /* the live side panel, pinned to the right edge at its real width */
  .panel{
    position:absolute; right:0; top:0;
    width:${PANEL_W}px; height:800px;
    background:var(--bg); border-left:1px solid #262b36;
    display:flex; flex-direction:column;
    box-shadow:-26px 0 70px rgba(0,0,0,.6);
  }
  .panel .app{display:flex; flex-direction:column; height:100%; min-height:0}
  .panel .list{flex:1; overflow:hidden}
  .panel .editor{margin-top:auto}
  /* it is a still image — drop the affordances that imply interaction */
  .panel *{cursor:default !important}
  textarea{resize:none}
  /* show the per-tab ✕ even without a hover, so the shot reads as editable */
  .session-tab .icon-btn.tiny.lit{opacity:1}
</style></head>
<body>
  <div class="copy">
    <span class="kicker">${kicker}</span>
    <h1>${headline}</h1>
    <p>${sub}</p>
  </div>
  <div class="panel"><div id="root"><div class="app">${panel}</div></div></div>
</body></html>`;

  fs.writeFileSync(path.join(OUT, file), html, "utf8");
  console.log("wrote", file);
}

shot({
  file: "shot-1-notes.html",
  kicker: "TabNotes",
  headline: "You have 30 tabs open.<br>In three days you'll<br>forget <em>why</em>.",
  sub: "Every tab manager sorts your tabs by title and URL. But the reason you opened one was never in the title — it was in your head. TabNotes lets you write it down, then find the tab again by searching what you wrote.",
  panel: panelNotes,
});

shot({
  file: "shot-2-search.html",
  kicker: "Search your own words",
  headline: "Type what you<br><em>remember</em>, not what<br>the page was called.",
  sub: "You won't recall that the page was titled “Pricing — Acme Corp”. You'll remember you needed it for the Thursday deck. Search across every note, title, and tag.",
  panel: panelSearch,
});

shot({
  file: "shot-3-edit.html",
  kicker: "Edit any note",
  headline: "Notes change.<br><em>So should notes.</em>",
  sub: "Click the pencil on any card to edit it in place. Enter saves, Escape cancels. No need to reopen the page just to fix a typo.",
  panel: panelEdit,
});

shot({
  file: "shot-4-sessions.html",
  kicker: "Saved sessions",
  headline: "Save a window.<br><em>Reshape it</em> before<br>you restore it.",
  sub: "Snapshot every tab you have open, then add or remove individual tabs from the snapshot later. Restore all of them at once, or just the one you need.",
  panel: panelSessions,
});

console.log("\ndone — 4 shots in", OUT);
