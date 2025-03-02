import { Button } from "@/components/ui/button";
import { messenger } from "@/lib/messaging";
import { Unplug, Wallet2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Auth({
  isSignedIn,
  userData,
  hostname,
}: {
  isSignedIn: boolean;
  userData: any;
  hostname: string;
}) {
  return hostname === "x.com" ? (
    <X isSignedIn={isSignedIn} userData={userData} />
  ) : (
    <Discord isSignedIn={isSignedIn} userData={userData} />
  );
}

const Discord = ({
  isSignedIn,
  userData,
}: {
  isSignedIn: boolean;
  userData: any;
}) => {
  const [discordConnectTargetElement, setDiscordConnectTargetElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const upperContainer = document.querySelector(".upperContainer__9293f");
      if (upperContainer) {
        const toolbar = upperContainer.querySelector(".toolbar__9293f");
        if (toolbar) {
          setDiscordConnectTargetElement(toolbar as HTMLElement);
          observer.disconnect();
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    discordConnectTargetElement &&
    createPortal(
      <Button
        size={"lg"}
        // variant={"outline"}
        // className="fixed top-1 right-3 gap-3"
        onClick={async () => {
          if (isSignedIn) {
            messenger.sendMessage("disconnectWallet", null);
          } else {
            messenger.sendMessage("connectWallet", null);
          }
        }}
      >
        {isSignedIn && userData ? (
          <Unplug strokeWidth={1.25} size={17} />
        ) : (
          <Wallet2 strokeWidth={1.25} size={17} />
        )}
        {isSignedIn ? "Disconnect" : "Connect Xender"}
      </Button>,
      discordConnectTargetElement,
    )
  );
};

const X = ({
  isSignedIn,
  userData,
}: {
  isSignedIn: boolean;
  userData: any;
}) => {
  return (
    <Button
      size={"lg"}
      variant={"outline"}
      className="fixed top-1 right-3 gap-3"
      onClick={async () => {
        if (isSignedIn) {
          messenger.sendMessage("disconnectWallet", null);
        } else {
          messenger.sendMessage("connectWallet", null);
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
  );
};
