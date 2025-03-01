import { useState, useEffect, useRef } from "react";
import {
  cleanDisplayName,
  hasValidSuffix,
  getUsernameFromUrl,
} from "@/utils/tweet";

export interface TweetInfo {
  element: Element;
  username: string;
  isInjected: boolean;
  receiverXUsername: string;
}

export const useTweetObserver = (isSignedIn: boolean) => {
  const [, forceUpdate] = useState({});
  const tweetsRef = useRef<Map<Element, TweetInfo>>(new Map());

  useEffect(() => {
    const injectPlaceholders = () => {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');
      let updated = false;

      tweets.forEach((tweet) => {
        if (!tweetsRef.current.has(tweet)) {
          const userNameDiv = tweet.querySelector(
            'div[data-testid="User-Name"]',
          );
          if (userNameDiv) {
            const displayNameSpan = userNameDiv.querySelector(
              "span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3",
            );
            if (displayNameSpan) {
              const displayName = displayNameSpan.textContent;
              if (displayName) {
                const baseCleanedDisplayName = cleanDisplayName(displayName);
                const cleanedDisplayName = baseCleanedDisplayName.toLowerCase();

                if (hasValidSuffix(cleanedDisplayName.trim())) {
                  const receiverXProfile = userNameDiv.querySelector(
                    "a",
                  ) as HTMLLinkElement | null;
                  const receiverXUsername = getUsernameFromUrl(
                    receiverXProfile && (receiverXProfile.href as string),
                  );

                  const tweetActions = tweet.querySelector('[role="group"]');

                  if (
                    tweetActions &&
                    !tweetActions.querySelector(".tip-button-placeholder")
                  ) {
                    const placeholder = document.createElement("div");
                    placeholder.className = "tip-button-placeholder";
                    placeholder.style.width = "0";
                    placeholder.style.height = "0";
                    placeholder.style.overflow = "hidden";
                    tweetActions.appendChild(placeholder);

                    tweetsRef.current.set(tweet, {
                      element: tweet,
                      username: cleanedDisplayName,
                      receiverXUsername: receiverXUsername,
                      isInjected: false,
                    });
                    updated = true;
                  }
                }
              }
            }
          }
        }
      });

      if (updated) {
        forceUpdate({});
      }
    };

    const observer = new MutationObserver(injectPlaceholders);
    observer.observe(document.body, { childList: true, subtree: true });

    injectPlaceholders();

    return () => observer.disconnect();
  }, [isSignedIn]);

  return tweetsRef;
};
