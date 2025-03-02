import { createPortal } from "react-dom";
import LeaderboardSheet from "./leaderboard-sheet";
import { useEffect, useState } from "react";
import TweetButtonInjector from "./tweet-button-injector";
import CartSheet from "./cart-sheet";
import ProfileButtonInjector from "./profile";

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
  const [profileUsername, setProfileUsername] = useState<string | null>(null);

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

  useEffect(() => {
    const checkIfValidProfile = () => {
      const url = window.location.pathname;
      const match = url.match(/^\/([^\/]+)$/);

      if (match) {
        setProfileUsername(match[1]);
        console.log(match[1]);
      } else {
        setProfileUsername(null);
      }
    };

    checkIfValidProfile();
  }, []);

  return (
    <>
      {leaderboardTargetEl &&
        createPortal(
          <div className="flex flex-col">
            <LeaderboardSheet />
            {isSignedIn && <CartSheet balance={balance} address={address} />}
          </div>,
          leaderboardTargetEl,
        )}

      {isSignedIn && (
        <ProfileButtonInjector
          username={profileUsername as string}
          stxAddr={address}
          balance={balance}
        />
      )}
      {isSignedIn && (
        <TweetButtonInjector
          stxAddr={address}
          balance={balance}
          isSignedId={isSignedIn}
        />
      )}
    </>
  );
}
