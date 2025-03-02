import Auth from "./_components/auth";
import X from "./_components/x";
import { useAuth } from "@/context/AuthContext";
import { useBalance } from "@/context/BalanceContext";
import { useHostname } from "@/hooks/useHostname";
import { useEffect } from "react";
import tailwindStyles from "~/assets/main.css?inline";
import { injectStyles } from "@/lib/utils";
import Discord from "./_components/discord";

export default () => {
  const hostname = useHostname();
  const { isSignedIn, address, userData } = useAuth();
  const { balance } = useBalance();

  useEffect(() => {
    injectStyles(tailwindStyles);
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
      {hostname === "discord.com" && (
        <Discord
          isSignedIn={isSignedIn}
          balance={balance}
          address={address as string}
        />
      )}
      <Auth isSignedIn={isSignedIn} userData={userData} hostname={hostname} />
    </div>
  );
};
