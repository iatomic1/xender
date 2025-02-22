import "./style.css";
import "~/assets/main.css";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ContentRoot } from "@/context/PortalTargetContext.tsx";
import { Toaster } from "@/components/ui/sonner";

let shadowRootContainer: HTMLElement | null = null;

// Function to handle Sonner styles
const handleSonnerStyles = (shadowRoot: ShadowRoot) => {
  // Initial check for existing styles
  const moveExistingStyles = () => {
    document.head.querySelectorAll("style").forEach((styleEl) => {
      if (styleEl.textContent?.includes("[data-sonner-toaster]")) {
        // Clone the style element to avoid removing it from the main DOM
        const clonedStyle = styleEl.cloneNode(true) as HTMLStyleElement;
        shadowRoot.appendChild(clonedStyle);
      }
    });
  };

  // Initial style movement
  moveExistingStyles();

  // Observer to catch dynamically added styles
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLStyleElement &&
          node.textContent?.includes("[data-sonner-toaster]")
        ) {
          const clonedStyle = node.cloneNode(true) as HTMLStyleElement;
          shadowRoot.appendChild(clonedStyle);
        }
      });
    });
  });

  // Start observing document.head for style changes
  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });

  return observer;
};

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "xender-root-ui",
      position: "inline",
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = "xender-root";
        container.append(app);
        shadowRootContainer = container;

        // Get the shadow root
        const shadowRoot = container.getRootNode() as ShadowRoot;

        // Handle Sonner styles
        const styleObserver = handleSonnerStyles(shadowRoot);

        const root = ReactDOM.createRoot(app);
        root.render(
          <ThemeProvider>
            <Toaster position="top-right" richColors />
            <ContentRoot />
          </ThemeProvider>,
        );

        // Return both root and observer for cleanup
        return { root, styleObserver };
      },
      onRemove: (resources) => {
        if (resources) {
          resources.root?.unmount();
          resources.styleObserver?.disconnect();
        }
        shadowRootContainer = null;
      },
    });
    ui.mount();
  },
});

export const getShadowRootContainer = () => shadowRootContainer;
