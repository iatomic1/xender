import "./style.css";
import "~/assets/main.css";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ContentRoot } from "@/context/PortalTargetContext.tsx";
import { Toaster } from "@/components/ui/sonner";

let shadowRootContainer: HTMLElement | null = null;

export default defineContentScript({
  matches: [
    "*://*.discord.com/*",
    "*://*.twitter.com/*",
    "*://twitter.com/*",
    "*://x.com/*",
  ],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "xender-root-ui",
      position: "inline",
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = "xender-root";
        container.append(app);
        container.classList.add("dark");
        shadowRootContainer = container;

        document.head.querySelectorAll("style").forEach((styleEl) => {
          if (styleEl.textContent?.includes("[data-sonner-toaster]")) {
            container.append(styleEl);
          }
        });

        const root = ReactDOM.createRoot(app);
        return root.render(
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theeme">
            <Toaster position="top-right" richColors />
            <ContentRoot />
          </ThemeProvider>,
        );
      },
      onRemove: (resources) => {
        shadowRootContainer = null;
      },
    });
    ui.mount();
  },
});

export const getShadowRootContainer = () => shadowRootContainer;
