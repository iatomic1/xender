import { getOwner } from "bns-v2-sdk";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Bitcoin } from "lucide-react";
import StxSbtcForm from "./stx-sbtc-form";

interface MiniButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  username: string;
  connectedStxAddr: string;
  balance: any;
  receiverXUsername: string;
  senderXUsername: string;
}

const TipBtn: React.FC<MiniButtonProps> = ({
  username,
  children,
  connectedStxAddr,
  balance,
  receiverXUsername,
  senderXUsername,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isApiCallComplete, setIsApiCallComplete] = useState(false);
  const [receiverStxAddr, setReceiverStxAddr] = useState<string | null>();

  useEffect(() => {
    const fetchBnsName = async () => {
      setIsLoading(true);
      try {
        const owner = await getOwner({
          fullyQualifiedName: username,
          network: "mainnet",
        });
        setReceiverStxAddr(owner);
      } catch (error) {
        console.error("Error fetching BNS details or balance:", error);
      } finally {
        setIsLoading(false);
        setIsApiCallComplete(true);
      }
    };

    fetchBnsName();
  }, [username]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" {...props} size={"icon"} variant={"outline"}>
          {children || <Bitcoin />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xend {username}</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Loading address..."
              : receiverStxAddr
                ? `Found Address for ${username}: ${receiverStxAddr}`
                : "Address not found"}
          </DialogDescription>
        </DialogHeader>
        {isApiCallComplete && receiverStxAddr ? (
          <p>Done</p>
        ) : (
          <div className="text-center py-4">
            {isApiCallComplete && receiverStxAddr
              ? "No BNS address found for this user. Unable to send tip."
              : "Loading..."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TipBtn;
