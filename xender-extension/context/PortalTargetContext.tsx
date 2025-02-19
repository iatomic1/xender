import App from "@/entrypoints/content/App";
import React, { useState } from "react";

export const PortalContext = React.createContext<HTMLElement | null>(null);

export const ContentRoot = () => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  return (
    <React.StrictMode>
      <PortalContext.Provider value={portalContainer}>
        <div ref={setPortalContainer} id="command-portal-container">
          <App />
        </div>
      </PortalContext.Provider>
    </React.StrictMode>
  );
};
