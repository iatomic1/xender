import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { UserData } from "@stacks/connect";
import { toast } from "sonner";
import { Unplug, Wallet2 } from "lucide-react";
import { getAccountBalance } from "../queries/balance";
import TweetButtonInjector from "./_components/tweet-button-injector";
import { websiteMessenger } from "@/lib/window-messaging";

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
        <TweetButtonInjector
          stxAddr={address as string}
          balance={balance}
          isSignedId={isSignedIn}
        />
      )}
      <Button
        size={"lg"}
        variant={"outline"}
        className="fixed top-1 right-3 z-[99] gap-3"
        onClick={async () => {
          if (isSignedIn) {
            websiteMessenger.sendMessage("disconnectWallet", null);
          } else {
            websiteMessenger.sendMessage("connectWallet", null);
            // window.postMessage({ type: "CONNECT_WALLET" }, "*");
          }
        }}
      >
        {isSignedIn && userData ? (
          <Unplug strokeWidth={1.25} size={17} />
        ) : (
          <Wallet2 strokeWidth={1.25} size={17} />
        )}
        {isSignedIn ? "Disconnect" : "Connect Xender"}
      </Button>
    </div>
  );
};
