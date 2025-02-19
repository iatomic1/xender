import "./style.css";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { i18nConfig } from "@/components/i18nConfig.ts";
import initTranslations from "@/components/i18n.ts";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ContentRoot } from "@/context/PortalTargetContext.tsx";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    initTranslations(i18nConfig.defaultLocale, ["common", "content"]);
    const ui = await createShadowRootUi(ctx, {
      name: "language-learning-content-box",
      position: "inline",
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = "command-palette-root";
        container.append(app);
        const root = ReactDOM.createRoot(container);
        root.render(
          <ThemeProvider>
            <ContentRoot />
          </ThemeProvider>,
        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
