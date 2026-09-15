import { browser } from "./browser";
import { noteKey } from "./storage";

/**
 * Jump to the page a note belongs to.
 *
 * If the page is already open somewhere, switch to that tab instead of piling
 * on a duplicate — which is the whole point of the extension. URLs are
 * compared through `noteKey` so a note still matches after tracking params or
 * a #hash have been added to the live tab.
 */
export async function focusOrOpenTab(url: string): Promise<void> {
  const target = noteKey(url);
  const tabs = await browser.tabs.query({});
  const existing = tabs.find((t) => t.url && noteKey(t.url) === target);

  if (existing?.id != null) {
    await browser.tabs.update(existing.id, { active: true });
    if (existing.windowId != null) {
      await browser.windows.update(existing.windowId, { focused: true });
    }
    return;
  }

  await browser.tabs.create({ url });
}
