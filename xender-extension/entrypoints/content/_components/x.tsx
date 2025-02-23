import { createPortal } from "react-dom";
import LeaderboardSheet from "./leaderboard-sheet";
import { useEffect, useState } from "react";
import TweetButtonInjector from "./tweet-button-injector";

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
        createPortal(<LeaderboardSheet />, leaderboardTargetEl)}
      <TweetButtonInjector
        stxAddr={address as string}
        balance={balance}
        isSignedId={isSignedIn}
      />
    </>
  );
}
