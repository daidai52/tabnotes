# TabNotes Privacy Policy

**Last updated: September 2026**

## The short version

TabNotes stores everything on your own computer. Nothing is sent anywhere.

## What TabNotes stores

- The notes you write for a page
- The page's URL and title (used to match the note back to the page)
- The page's favicon URL (so the note list shows site icons)
- Saved tab sessions (list of URLs you chose to save)

## Where it is stored

All of the above is written to `chrome.storage.local` inside your browser
profile. It never leaves your device. TabNotes has no server, no database, and
no analytics.

## What TabNotes does not do

- It does not transmit your data to any server
- It does not collect personal information
- It does not track your browsing history
- It does not use cookies or any third-party analytics
- It does not sell or share data with anyone

## Permissions and why they are needed

| Permission | Why |
|---|---|
| `tabs` | Read the active tab's URL and title so a note can be attached to the right page, and list the tabs in a session you save |
| `storage` | Save your notes and sessions locally |
| `sidePanel` | Display the TabNotes interface in Chrome's side panel |

## Deleting your data

Delete individual notes with the ✕ button in the note list. Removing the
extension from `chrome://extensions` deletes all stored notes and sessions
permanently.

## Contact

Questions or concerns: open an issue at
https://github.com/daidai52/tabnotes/issues
