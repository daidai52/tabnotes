/**
 * `sidebarAction` is Firefox-only and neither @types/chrome nor WXT ships a
 * declaration for it, so narrow it locally rather than widening the global
 * browser type.
 */
interface FirefoxSidebarAction {
  onClicked: { addListener: (cb: () => void) => void };
  open: () => Promise<void>;
}

export default defineBackground(() => {
  if (import.meta.env.BROWSER === "firefox") {
    // A `sidebar_action` alone leaves the toolbar icon inert — clicking it does
    // nothing at all. Bind it so the icon behaves like every other extension's.
    const sidebar = (browser as unknown as { sidebarAction: FirefoxSidebarAction })
      .sidebarAction;
    chrome.browserAction.onClicked.addListener(() => {
      void sidebar.open();
    });
    return;
  }

  // Chrome/Edge: clicking the toolbar icon opens the side panel.
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error("[TabNotes] setPanelBehavior failed:", err));
});
