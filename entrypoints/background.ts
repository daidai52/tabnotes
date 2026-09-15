export default defineBackground(() => {
  // Chrome/Edge: clicking the toolbar icon opens the side panel.
  // Firefox has no sidePanel API — its sidebar toggles from the browser UI.
  if (import.meta.env.BROWSER !== "firefox" && chrome.sidePanel) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.error("[TabNotes] setPanelBehavior failed:", err));
  }
});
