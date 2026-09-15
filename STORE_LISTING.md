# Chrome Web Store Listing

Paste these into the developer console when submitting.

## Name (max 45 chars)

```
TabNotes — Tab Manager with Notes
```

## Short description (max 132 chars)

```
Give every tab a note. Find any tab again by what it was for — not just its title. Local-only, no account, no tracking.
```

## Category

`Productivity` → `Workflow`

## Language

English

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
• Saved sessions — snapshot all your open tabs and restore them later
• Star the notes that matter
• Works in Chrome's side panel, so it stays out of your way

PRIVATE BY DESIGN

TabNotes has no server, no account, and no analytics. Your notes are stored in your own browser and never leave your computer. There is nothing to sign up for and nothing to leak.

FREE AND PRO

The free version includes 50 notes — enough to find out whether this fits how you work. Pro removes the limit and adds unlimited sessions.

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
https://github.com/daidai52/tabnotes
```

## Privacy policy URL

Host `PRIVACY.md` and paste the public URL here. The Chrome Web Store requires
a reachable privacy policy URL for any extension that handles browsing data.
