import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  manifest: ({ browser }) => ({
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    version: "0.1.0",
    // Chrome/Edge expose a side panel; Firefox calls the same surface a sidebar
    // and WXT maps it to `sidebar_action`.
    permissions:
      browser === "firefox" ? ["tabs", "storage"] : ["tabs", "storage", "sidePanel"],
    action: {
      default_title: "__MSG_extName__",
    },
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      96: "icon/96.png",
      128: "icon/128.png",
    },
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              // AMO rejects an unsigned submission without a stable add-on id.
              id: "tabnotes@daidai52.github.io",
              strict_min_version: "109.0",
              // Mandatory for new AMO submissions since 2025-11-03. "none" must
              // be the sole entry, and it is accurate here: every note, session,
              // and page title stays in chrome.storage.local — the extension has
              // no server and transmits nothing.
              data_collection_permissions: {
                required: ["none"],
              },
            },
          },
        }
      : {}),
  }),
});
