import { Button } from "@/components/ui/button";
import { websiteMessenger } from "@/lib/window-messaging";
import { Unplug, Wallet2 } from "lucide-react";

export default function Auth({
  isSignedIn,
  userData,
}: {
  isSignedIn: boolean;
  userData: any;
}) {
  return (
    <Button
      size={"lg"}
      variant={"outline"}
      className="fixed top-1 right-3 gap-3"
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
  );
}
