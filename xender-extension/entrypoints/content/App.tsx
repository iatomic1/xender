import { useEffect, useState } from "react";
import { UserData } from "@stacks/connect";
import { toast } from "sonner";
import { getAccountBalance } from "../queries/balance";
import TweetButtonInjector from "./_components/tweet-button-injector";
import { websiteMessenger } from "@/lib/window-messaging";
import { createPortal } from "react-dom";
import LeaderboardSheet from "./_components/leaderboard-sheet";
import Auth from "./_components/auth";
import LeaderboardMount from "./_components/leaderboard-mount";
import X from "./_components/x";

export default () => {
  const [hostname, setHostname] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balance, setBalance] = useState<any | null>(null);

  useEffect(() => {
    const checkHostname = () => {
      const hostname = window.location.hostname;
      setHostname(hostname);
    };

    checkHostname();
    window.addEventListener("popstate", checkHostname);

    return () => {
      window.removeEventListener("popstate", checkHostname);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = websiteMessenger.onMessage(
      "userSession",
      (message: any) => {
        console.log("Received user session:", message);
        const data = message.data.input;
        const { isSignedIn, userData } = data;

        setIsSignedIn(isSignedIn);
        setUserData(userData);

        if (isSignedIn && userData) {
          const stxAddress = userData.profile.stxAddress.mainnet;
          setAddress(stxAddress);

          getAccountBalance(stxAddress)
            .then((balanceData) => {
              setBalance(balanceData);
              console.log("User balance:", balanceData);
            })
            .catch((error) => {
              console.error("Error fetching user balance:", error);
              toast.error("Failed to fetch user balance");
            });
        } else {
          setBalance(null);
        }
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {hostname === "x.com" && (
        <X
          isSignedIn={isSignedIn}
          balance={balance}
          address={address as string}
        />
      )}
      <Auth isSignedIn={isSignedIn} userData={userData} />
    </div>
  );
};
