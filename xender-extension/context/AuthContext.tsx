import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserData } from "@stacks/connect";
import { messenger } from "@/lib/messaging";

interface AuthContextType {
  isSignedIn: boolean;
  userData: UserData | null;
  address: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  userData: null,
  address: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = messenger.onMessage("userSession", (message: any) => {
      console.log("Received user session:", message);
      const data = message.data.input;
      const { isSignedIn, userData } = data;

      setIsSignedIn(isSignedIn);
      setUserData(userData);

      if (isSignedIn && userData) {
        const stxAddress = userData.profile.stxAddress.mainnet;
        setAddress(stxAddress);
      } else {
        setAddress(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isSignedIn, userData, address }}>
      {children}
    </AuthContext.Provider>
  );
};
