# Store Listing Copy

Paste these into the developer console when submitting. Covers Firefox (AMO),
Microsoft Edge, and the Chrome Web Store; the differences are called out inline.

## Name (max 45 chars)

```
TabNotes — Tab Manager with Notes
```

## Short description (max 132 chars)

```
Give every tab a note. Find any tab again by what it was for — not just its title. Local-only, no account, no tracking.
```

## Category

AMO: `Tabs`
Chrome / Edge: `Productivity` → `Workflow`

## Language

English

## Tags (AMO only)

AMO uses a fixed tag vocabulary — there is no `tabs`, `notes`, or
`productivity` tag to pick. Only two entries in that vocabulary describe
TabNotes honestly:

```
search, privacy
```

`search` maps to the core feature. `privacy` maps to the local-only storage
model. Deliberately skipped: `security` reads as a security-tool tag
(alongside antivirus and password managers) and would pull in the wrong
audience.

## Search terms (Edge only)

Edge has a free-text search-terms field that AMO and Chrome lack. Limits: at
most **7 terms**, **21 words** total, **30 characters** per term. Not shown to
users — it only feeds store search.

```
tab manager
notes
tab notes
session manager
tab session
search tabs
productivity
```

## Edge-only fields

Three things Edge asks for that the other two stores do not:

| Field | Value |
|---|---|
| Search terms | the block above |
| Promo tile, 1400×560 | optional; `shots/promo-440x280.png` is the small tile and suffices |
| Properties → Website | `https://daidai52.github.io/tabnotes/` |

Edge keeps privacy information on a **dedicated Privacy page** (moved out of
Properties in 2026), so the policy URL goes there rather than in the listing
form:

## Detailed description

```
You have 30 tabs open. Three days from now you'll have no idea why.

Every tab manager sorts your tabs by title and URL — but the reason you opened a tab was never in the title. It was in your head. That's the part you forget.

TabNotes fixes that. Attach a note to any page — one line is enough:

  "competitor pricing, cite in Thursday deck"
  "recipe — halve the sugar"
  "bug repro, check again after deploy"

Then find it again by searching what you wrote. Not by squinting at 30 identical-looking tabs.

WHAT YOU GET

• Per-tab notes — your note follows the page, so it survives closing and restoring the tab
• Search across every note, title, and tag
• Saved sessions — snapshot all your open tabs and restore them later, and add or remove individual tabs from a saved session
• Edit any note in place, without reopening the page
• Star the notes that matter
• Click any note to jump to that tab, or open it if it is closed
• Works in Chrome's side panel, so it stays out of your way

PRIVATE BY DESIGN

TabNotes has no server, no account, and no analytics. Your notes are stored in your own browser and never leave your computer. There is nothing to sign up for and nothing to leak.

FREE

Every feature is available with no account, no sign-up, and no time limit. The interface is available in English and Simplified Chinese.

Questions or feature requests: the issue tracker in the support link is the fastest way to reach the developer.
```

## Permission justifications

The console asks for a justification per permission. Use:

**`tabs`**
```
Reads the active tab's URL and title so a note can be attached to the page you
are looking at, and lists the tabs in a window when the user saves a session.
No browsing data is transmitted or stored outside the browser.
```

**`storage`**
```
Persists the user's notes and saved sessions locally via chrome.storage.local.
Required for the extension's core feature. No data leaves the device.
```

**`sidePanel`**
```
Displays the TabNotes interface in Chrome's side panel, which is the
extension's only UI surface.
```

**Remote code:** answer **No** — the extension ships no remote code and uses no `eval`.

**Data usage:** check "does not collect or use user data" — nothing leaves the device.

## Support URL

```
https://github.com/daidai52/tabnotes/issues
```

## Homepage URL

```
https://daidai52.github.io/tabnotes/
```

## Privacy policy URL

```
https://daidai52.github.io/tabnotes/privacy.html
```

Live. The Chrome Web Store requires a reachable privacy policy URL for any
extension that handles browsing data; this one returns HTTP 200 and contains no
trackers.

## Screenshots

Upload all four, in this order. Each is exactly 1280×800, which satisfies both
Chrome (1280×800 or 640×400) and Edge.

| File | Shows |
|---|---|
| `shots/shot-1-notes.png` | The note list, with the composer and Save button |
| `shots/shot-2-search.png` | Searching `thursday deck` and one matching note |
| `shots/shot-3-edit.png` | A note open in inline edit mode |
| `shots/shot-4-sessions.png` | An expanded session with per-tab ✕ buttons |

Regenerate any of them with:

```bash
node shots/gen.cjs && node shots/render.cjs   # the four 1280x800 shots
node shots/promo.cjs                          # the 440x280 promo tile
```

## Promo tile (Edge, optional)

`shots/promo-440x280.png` — 440×280, the "small promotional tile" size. Chrome
no longer shows a promo tile; Edge does.

## Things only you can fill in

These cannot be scripted — the store asks for them on your account:

- **Developer name / publisher** — shows publicly
- **Contact email** — must be one you can receive mail at
- **Category** — `Productivity` → `Workflow`
- **Refund / support statement** — a sentence is enough

## Store URLs once published

Paste these back into `README.md` and `docs/index.html` (both currently point at
the generic store homepages):

- Chrome: `https://chromewebstore.google.com/detail/<id>`
- Edge: `https://microsoftedge.microsoft.com/addons/detail/<id>`
- Firefox: `https://addons.mozilla.org/firefox/addon/tabnotes/`
