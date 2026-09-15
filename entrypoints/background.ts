import { chromeOnly, firefoxOnly } from "@/lib/browser";

export default defineBackground(() => {
  if (import.meta.env.BROWSER === "firefox") {
    // A `sidebar_action` alone leaves the toolbar icon inert — clicking it does
    // nothing at all. Bind it so the icon behaves like every other extension's.
    firefoxOnly.browserAction.onClicked.addListener(() => {
      void firefoxOnly.sidebarAction.open();
    });
    return;
  }

  // Chrome/Edge: clicking the toolbar icon opens the side panel.
  chromeOnly.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error("[TabNotes] setPanelBehavior failed:", err));
});
