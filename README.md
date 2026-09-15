# TabNotes

A tab manager that remembers **why** you opened each tab.

Every other tab manager sorts your tabs by title and URL. But the reason you
opened a tab — the thing you were actually looking for — is in your head, and
it's gone by the time you come back three days later. TabNotes lets you attach a
note to any page, then find it again by searching the note.

**Website:** https://daidai52.github.io/tabnotes/
**Privacy policy:** https://daidai52.github.io/tabnotes/privacy.html

## Features

- **Per-tab notes** — attach a note to any page; it follows the URL, so it
  survives closing and restoring the tab
- **Search across notes** — find a tab by what it was for, not just its title
- **Saved sessions** — snapshot every tab in the window and restore it later;
  add or remove individual tabs from a saved session at any time
- **Edit any note** — inline editing, no need to re-open the page
- **Starred notes** — pin the ones that matter
- **Private by design** — everything is stored locally in
  `chrome.storage.local`; no account, no server, no telemetry

## Install

| Browser | Store |
|---|---|
| Chrome | Chrome Web Store |
| Edge | Microsoft Edge Add-ons |
| Firefox | Firefox Add-ons |

## Development

```bash
npm install
npm run dev          # Chrome, with hot reload
npm run dev:firefox  # Firefox, with hot reload
npm run build        # production build → .output/chrome-mv3
npm run zip          # packaged zips for all three stores
```

Load the unpacked build from `chrome://extensions` → *Load unpacked* →
`.output/chrome-mv3`.

## Stack

- [WXT](https://wxt.dev) — extension framework (Vite-based, MV3)
- React 19
- TypeScript
- `chrome.storage.local` for persistence
- `@wxt-dev/i18n` for the English / Simplified Chinese UI

No backend. No API keys. No recurring costs.

## Repository layout

```
entrypoints/     extension entry points (background, side panel)
lib/             storage, tab helpers, shared types
locales/         i18n strings (en, zh_CN)
public/icon/     extension icons
docs/            landing page + privacy policy, served by GitHub Pages
```

## Privacy

See [PRIVACY.md](./PRIVACY.md). All data stays on the user's machine.

## License

MIT
