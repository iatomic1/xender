import "../assets/main.css";
import { Button } from "@/components/ui/button";
import App from "@/entrypoints/content/App";
import React, { useState } from "react";
import { useTheme } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const PortalContext = React.createContext<HTMLElement | null>(null);

export const ContentRoot = () => {
  const { theme, toggleTheme } = useTheme();
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  return (
    <React.StrictMode>
      <PortalContext.Provider value={portalContainer}>
        <div
          ref={setPortalContainer}
          id="command-portal-container"
          className={theme}
        >
          <Button
            onClick={() => {
              toast.success("Hello");
            }}
            className="top-4 right-4 fixed z-[999999999999999999999]"
          >
            me orewa
          </Button>
          <App />
        </div>
      </PortalContext.Provider>
    </React.StrictMode>
  );
};
