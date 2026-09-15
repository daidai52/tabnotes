# Manual test checklist — Edge

Chrome 143 refuses `--load-extension` on the command line, so the Chrome/Edge
build cannot be exercised by a script the way the Firefox build was. This has
to be done by hand. It takes about ten minutes.

## Load it

1. Open `edge://extensions`
2. Turn on **Developer mode** (bottom-left)
3. Click **Load unpacked**
4. Pick the **folder**, not the zip:

   ```
   D:\tmp\tabnotes\.output\chrome-mv3
   ```

   Edge cannot load a `.zip` unpacked; it wants the directory.

5. TabNotes appears in the list. **Check for a red error banner** — if one
   shows, click it and send me the text.

## The things that were broken on Firefox

These are the ones worth checking first, since the same class of bug could
hide here.

| # | Do this | Expect |
|---|---|---|
| 1 | Click the TabNotes icon in the toolbar | The side panel opens |
| 2 | Look at the panel header | It shows **the title of the page you are on**, not "No active tab" |
| 3 | Click into the note box and type | Characters appear. The box must not be greyed out |
| 4 | Press Enter | The button flashes "Saved ✓" and the note appears in the list above |

If #2 fails, the panel cannot read the active tab. If #3 fails, the box is
disabled because of #2. Same failure mode as the Firefox bug.

## The rest of the features

| # | Do this | Expect |
|---|---|---|
| 5 | Switch to another tab, then back | The note box follows the tab you are on |
| 6 | Search for a word you wrote | The list filters down |
| 7 | Click a note's title | It switches to that tab (or opens it if closed) |
| 8 | Click any note's ✎ | It becomes editable; Enter saves, Esc cancels |
| 9 | Click ★ on a note | It turns gold and stays gold after a reload |
| 10 | Go to **Sessions**, click "Save all tabs in this window" | A new session appears with the right tab count |
| 11 | Click the session header | It expands and lists its tabs |
| 12 | Hover a tab row, click ✕ | That tab leaves the session; the count drops |
| 13 | Click "＋ Add current tab" | The current page is appended |
| 14 | Click "Open all tabs" | Those pages open in background tabs |
| 15 | Delete a session | It disappears |

## Appearance

| # | Do this | Expect |
|---|---|---|
| 16 | Resize the panel by dragging its edge | Layout reflows, nothing overlaps |
| 17 | Switch Edge to light mode (`edge://settings/appearance`) | The panel turns light; text stays readable |

## After a reload

| # | Do this | Expect |
|---|---|---|
| 18 | Go to `edge://extensions`, click **Reload** on TabNotes, reopen the panel | Your notes are still there |
| 19 | Close Edge completely, reopen, open the panel | Notes still there. (Unpacked extensions survive restarts, unlike Firefox's temporary add-ons.) |

## Reporting back

Tell me which numbered steps failed. For anything visual, a screenshot is
faster than describing it. If a step threw an error, get the message from the
panel's own console:

1. Right-click inside the side panel → **Inspect**
2. Switch to the **Console** tab
3. Copy anything in red

That console is where a `TypeError` would have shown up on Firefox — worth
glancing at even if nothing looks wrong.

## Once it passes

The same folder is what gets zipped for the store, so a pass here means the
Edge submission is ready:

```bash
node verify.cjs          # rebuilds and re-checks both packages
```

Then upload `tabnotes-0.1.1-chrome.zip` to Partner Center.
