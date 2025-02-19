import "../../assets/main.css";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/components/theme-provider.tsx";
import { Button } from "@/components/ui/button";
import { UserData } from "@stacks/connect";
import { toast } from "sonner";
import { Unplug, Wallet2 } from "lucide-react";
import { getAccountBalance } from "../queries/balance";
import TweetButtonInjector from "./_components/tweet-button-injector";

export default () => {
  const { theme, toggleTheme } = useTheme();
  const [hostname, setHostname] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balance, setBalance] = useState<any | null>(null);

  function domLoaded() {
    console.log("dom loaded");
  }

  useEffect(() => {
    if (document.readyState === "complete") {
      // load event has already fired, run your code or function here
      domLoaded();
    } else {
      // load event hasn't fired, listen for it
      window.addEventListener("load", () => {
        // your code here
        console.log(window.location.href);
        domLoaded();
      });
    }
  }, []);

  useEffect(() => {
    const checkHostname = () => {
      const hostname = window.location.hostname;
      setHostname(hostname);
      // setIsTwitter(hostname === "x.com" || hostname === "twitter.com");
      // setIsDiscord(hostname === "discord.com");
      // setIsStxCity(hostname === "stx.city");
    };

    checkHostname();
    window.addEventListener("popstate", checkHostname);

    return () => {
      window.removeEventListener("popstate", checkHostname);
    };
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === "USER_SESSION_LOADED") {
        const { isSignedIn, userData } = event.data.data;
        setIsSignedIn(isSignedIn);
        setUserData(userData);

        if (isSignedIn) {
          console.log("User is signed in:", userData);
          const stxAddress = userData.profile.stxAddress.mainnet;
          setAddress(stxAddress);

          try {
            const balanceData = await getAccountBalance(stxAddress);
            setBalance(balanceData);
            console.log("User balance:", balanceData);
          } catch (error) {
            console.error("Error fetching user balance:", error);
            toast.error("Failed to fetch user balance", {
              richColors: true,
              position: "top-right",
            });
          }
        } else {
          console.log("User is not signed in");
          setBalance(null);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className={theme}>
      <TweetButtonInjector
        stxAddr={address as string}
        balance={balance}
        isSignedId={isSignedIn}
      />
      <Toaster />
      <Button
        size={"lg"}
        variant={"outline"}
        className="fixed bottom-5 right-4 z-[99] gap-3"
        onClick={async () => {
          if (isSignedIn) {
            window.postMessage({ type: "DISCONNECT_WALLET" }, "*");
          } else {
            window.postMessage({ type: "CONNECT_WALLET" }, "*");
          }
        }}
      >
        {isSignedIn ? (
          <Unplug strokeWidth={1.25} size={17} />
        ) : (
          <Wallet2 strokeWidth={1.25} size={17} />
        )}
        {isSignedIn ? "Disconnect" : "Connect Xender"}
      </Button>
    </div>
  );
};
