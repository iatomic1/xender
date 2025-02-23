import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

export default defineConfig({
  manifest: {
    permissions: ["activeTab", "scripting", "sidePanel", "storage", "tabs"],
    action: {},
    name: "Xender",
    description: "__MSG_extDescription__",
    default_locale: "en",
    web_accessible_resources: [
      {
        resources: ["example-main-world.js", "transactions.js", "connect.js"],
        matches: ["*://*/*"],
      },
    ],
  },
  vite: () => ({
    plugins: [react()],
  }),
});
