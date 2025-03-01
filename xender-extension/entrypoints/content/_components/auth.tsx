import { Button } from "@/components/ui/button";
import { messenger } from "@/lib/messaging";
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
}
