import Auth from "./_components/auth";
import X from "./_components/x";
import { useAuth } from "@/context/AuthContext";
import { useBalance } from "@/context/BalanceContext";
import { useHostname } from "@/hooks/useHostname";

export default () => {
  const hostname = useHostname();
  const { isSignedIn, address, userData } = useAuth();
  const { balance } = useBalance();

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
