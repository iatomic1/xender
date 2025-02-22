import "~/assets/main.css";
import { Button } from "@/components/ui/button";
import {
  cleanDisplayName,
  hasValidSuffix,
  getUsernameFromUrl,
} from "@/lib/helpers";
import ReactDOM from "react-dom";

export default defineContentScript({
  matches: ["<all_urls>"],

  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: "inline",
      anchor: 'article[data-testid="tweet"]', // Observe tweet elements
      onMount: (container) => {
        // Extract necessary information from the tweet element
        const tweet = container.closest('article[data-testid="tweet"]');
        console.log(tweet);
        if (!tweet) return;

        const userNameDiv = tweet.querySelector('div[data-testid="User-Name"]');
        if (!userNameDiv) return;

        const displayNameSpan = userNameDiv.querySelector(
          "span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3",
        );
        if (!displayNameSpan || !displayNameSpan.textContent) return;

        const displayName = displayNameSpan.textContent;
        const baseCleanedDisplayName = cleanDisplayName(displayName);
        const cleanedDisplayName = baseCleanedDisplayName.toLowerCase();

        if (!hasValidSuffix(cleanedDisplayName.trim())) return;

        const receiverXProfile = userNameDiv.querySelector(
          "a",
        ) as HTMLLinkElement | null;
        const receiverXUsername = getUsernameFromUrl(
          receiverXProfile?.href || "",
        );

        // Mount the TipBtn component
        ReactDOM.render(<Button>Hello</Button>, container);
      },
      onUnmount: (container) => {
        // Clean up when the element is removed
        ReactDOM.unmountComponentAtNode(container);
      },
    });

    // Start observing for dynamic elements
    ui.autoMount();
  },
});
