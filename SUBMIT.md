# Submitting TabNotes to the stores

Everything here is prepared. You need about 40 minutes and one browser window.
Do Edge first — it is free, and the review is the most forgiving.

## What is already done

| Thing | Where |
|---|---|
| Chrome/Edge package | `.output/tabnotes-0.1.1-chrome.zip` |
| Firefox package | `.output/tabnotes-0.1.1-firefox.zip` |
| Firefox source package (AMO requires it) | `.output/tabnotes-0.1.1-sources.zip` |
| Four screenshots, exactly 1280×800 | `shots/shot-{1..4}-*.png` |
| Promo tile, 440×280 | `shots/promo-440x280.png` |
| Privacy policy, live | https://daidai52.github.io/tabnotes/privacy.html |
| Homepage, live | https://daidai52.github.io/tabnotes/ |
| Support URL | https://github.com/daidai52/tabnotes/issues |
| Store copy (name, description, justifications) | `STORE_LISTING.md` |

The version number lives only in `package.json`. WXT copies it into the
manifest and into the zip filenames, so there is one number to change.

Rebuild and re-verify at any time:

```bash
node verify.cjs
```

That builds both packages and then checks them the way a reviewer would:
manifest invariants, the Firefox background script, a `web-ext lint` run (the
same validator AMO uses on upload), and the contents of the sources archive.
It exits non-zero if anything regresses.

## 1. Microsoft Edge Add-ons — free, do this first

<https://partner.microsoft.com/dashboard/microsoftedge/public/login>

1. Sign in with a Microsoft account. Register as an individual developer — no
   company, no fee, no tax form.
2. **Create new extension** → upload
   `.output/tabnotes-0.1.0-chrome.zip`.
3. Paste the fields from `STORE_LISTING.md`:
   - Name, short description, detailed description
   - Category: `Productivity` → `Workflow`
   - Support URL, homepage URL, privacy policy URL
4. Upload the four screenshots from `shots/`.
5. **Permissions justification** — paste the per-permission text from
   `STORE_LISTING.md`. Edge asks for this; a vague answer is the single most
   common reason a submission is bounced.
6. Data usage: select **does not collect or use user data**.
7. Submit. Edge review typically takes 1–7 business days.

## 2. Firefox Add-ons (AMO) — free

<https://addons.mozilla.org/developers/>

1. Sign in with a Firefox account. No fee.
2. **Submit a New Add-on** → *On this site* → upload
   `.output/tabnotes-0.1.1-firefox.zip`.
3. Upload a **new version**, not a new add-on — `tabnotes@daidai52.github.io`
   is already registered as the add-on id, and reusing it is what lets existing
   installs update in place.
4. The package already declares
   `browser_specific_settings.gecko.data_collection_permissions: { required:
   ["none"] }` in its manifest. AMO has required this for every **new** add-on
   since 2025-11-03, and rejects the upload outright without it — the error
   reads *"The data_collection_permissions property is missing"*. `"none"` is
   accurate: TabNotes transmits nothing.
5. When it asks for source code, upload
   `.output/tabnotes-0.1.1-sources.zip`. It asks because the build is a bundle;
   supplying the sources keeps the review moving.
6. Paste the listing copy, upload the screenshots, set the privacy policy URL.
7. Firefox opens TabNotes in the **sidebar**, not a side panel — that is
   expected, and WXT maps it automatically via `sidebar_action`.

### What changed in 0.1.1

Fix this before the add-on is approved, or ship it as the first update —
either way it needs to land:

- **The toolbar icon did nothing on Firefox.** The background script guarded
  its only side-effect behind a `!== "firefox"` check, so the compiled
  `background.js` was an empty function. It now binds
  `browserAction.onClicked` → `sidebarAction.open()`. Without this a new user
  clicks the icon, sees nothing happen, and uninstalls.
- **`strict_min_version` was 109.0, which was wrong.** `web-ext lint` flagged
  it: `data_collection_permissions` is only understood from Firefox 140
  (desktop) and 142 (Android). A 109 install would have received the add-on
  without being able to read the consent declaration. Raised to `142.0`.

If AMO rejects the Manifest V2 package, build the MV3 variant instead:
`npx wxt build -b firefox --mv3` then zip `.output/firefox-mv3`. It carries the
same `data_collection_permissions` declaration.

## 3. Chrome Web Store — $5 one-time

<https://chrome.google.com/webstore/devconsole>

Do this one last. It costs money and has the strictest review.

1. Register a developer account. There is a **one-time $5 USD fee**. A Chinese
   mainland debit card will not work — the registration is a Google Payments
   flow, so you need a card that Google accepts. Alternatives if you do not have
   one: a friend or family member registers and adds you as a publisher, or you
   wait until Edge and Firefox have shown the extension is worth the $5.
2. **New item** → upload `.output/tabnotes-0.1.0-chrome.zip`.
3. Fill the listing from `STORE_LISTING.md`. In the *Privacy* tab:
   - Single purpose: `Give any tab a note, and find the tab again by searching
     that note.`
   - Justification per permission (paste from `STORE_LISTING.md`)
   - Remote code: **No**
   - Data usage: **does not collect or use user data**
4. Upload the four screenshots.
5. Submit. First review commonly takes 1–3 weeks.

## Order matters

Publish Edge and Firefox first. They are free, they let you find out whether
anyone actually installs this, and a live listing on either one makes the $5
Chrome decision easy to justify.

## Not required for any of these

- A company or business registration
- A passport or ID document
- A domain name
- A server, database, or backend of any kind
- A payment processor (the Pro tier is not wired up yet — see `README.md`)
