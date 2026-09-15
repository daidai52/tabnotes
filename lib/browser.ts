import { browser } from "wxt/browser";

/**
 * The one place extension APIs are reached from.
 *
 * Firefox splits the API in two: `chrome.*` is callback-style and returns
 * `undefined`, `browser.*` returns promises. Chrome returns promises from both.
 * So `await chrome.tabs.query(...)` looks harmless but yields `undefined` under
 * Firefox, and any destructuring of that result throws — which is what made the
 * side panel fail to read the active tab, refuse input, and fail to save
 * sessions. The `browser` export is promise-returning on both engines.
 */
export { browser };

/** Chrome-only surface. Nothing here exists in Firefox, so guard before use. */
export const chromeOnly = browser as unknown as {
  sidePanel: {
    setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void>;
  };
};

/** Firefox-only surface. Nothing here exists in Chrome, so guard before use. */
export const firefoxOnly = browser as unknown as {
  sidebarAction: {
    open(): Promise<void>;
  };
  browserAction: {
    onClicked: {
      addListener(callback: () => void): void;
    };
  };
};
