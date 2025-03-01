import "../assets/main.css";
import App from "@/entrypoints/content/App";
import React, { useState } from "react";
import { useTheme } from "@/components/theme-provider.tsx";
import { AuthProvider } from "./AuthContext";
import { BalanceProvider } from "./BalanceContext";

export const PortalContext = React.createContext<HTMLElement | null>(null);

export const ContentRoot = () => {
  const { theme, toggleTheme } = useTheme();
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  return (
    <React.StrictMode>
      <AuthProvider>
        <BalanceProvider>
          <PortalContext.Provider value={portalContainer}>
            <div
              ref={setPortalContainer}
              id="command-portal-container"
              className={theme}
            >
              {/* <Button */}
              {/*   onClick={() => { */}
              {/*     toast.success("Hello"); */}
              {/*   }} */}
              {/*   className="top-4 left-4 fixed z-[999999999999999999999]" */}
              {/* > */}
              {/*   me orewa */}
              {/* </Button> */}
              <App />
            </div>
          </PortalContext.Provider>
        </BalanceProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};
