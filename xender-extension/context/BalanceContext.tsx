import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { getAccountBalance } from "../queries/balance";
import { useAuth } from "./AuthContext";

interface BalanceContextType {
  balance: any | null;
  refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType>({
  balance: null,
  refreshBalance: async () => {},
});

export const useBalance = () => useContext(BalanceContext);

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({
  children,
}) => {
  const [balance, setBalance] = useState<any | null>(null);
  const { address, isSignedIn } = useAuth();

  const fetchBalance = async (stxAddress: string) => {
    try {
      const balanceData = await getAccountBalance(stxAddress);
      setBalance(balanceData);
      console.log("User balance:", balanceData);
      return balanceData;
    } catch (error) {
      console.error("Error fetching user balance:", error);
      toast.error("Failed to fetch user balance");
      throw error;
    }
  };

  const refreshBalance = async () => {
    if (isSignedIn && address) {
      return fetchBalance(address);
    }
    return Promise.resolve(null);
  };

  useEffect(() => {
    if (isSignedIn && address) {
      fetchBalance(address);
    } else {
      setBalance(null);
    }
  }, [isSignedIn, address]);

  return (
    <BalanceContext.Provider value={{ balance, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
