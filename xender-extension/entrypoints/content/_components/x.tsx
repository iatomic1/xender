import { createPortal } from "react-dom";
import LeaderboardSheet from "./leaderboard-sheet";
import { useEffect, useState } from "react";
import TweetButtonInjector from "./tweet-button-injector";
import tailwindStyles from "~/assets/main.css?inline";
import { injectStyles } from "@/lib/utils";
import CartSheet from "./cart-sheet";

export default function X({
  address,
  balance,
  isSignedIn,
}: {
  isSignedIn: boolean;
  address: string;
  balance: any;
}) {
  const [leaderboardTargetEl, setLeaderboardTargetEl] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    injectStyles(tailwindStyles);
    const observer = new MutationObserver(() => {
      const target = document.querySelector(
        'a[aria-label="Post"][data-testid="SideNav_NewTweet_Button"][href="/compose/post"]',
      )?.parentElement;
      if (target) {
        setLeaderboardTargetEl(target);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {leaderboardTargetEl &&
        createPortal(
          <div className="flex flex-col">
            <LeaderboardSheet />
            <CartSheet balance={balance} address={address as string} />
          </div>,
          leaderboardTargetEl,
        )}
      <TweetButtonInjector
        stxAddr={address as string}
        balance={balance}
        isSignedId={isSignedIn}
      />
    </>
  );
}
