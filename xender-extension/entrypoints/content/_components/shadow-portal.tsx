import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getShadowRootContainer } from "..";

interface ShadowRootPortalProps {
  children: React.ReactNode;
  container: HTMLElement;
}

export const ShadowRootPortal = ({
  children,
  container,
}: ShadowRootPortalProps) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const shadowRootContainer = getShadowRootContainer();
    if (shadowRootContainer) {
      // Create a portal root inside the shadow root
      const portalRoot = document.createElement("div");
      shadowRootContainer.append(portalRoot);
      setPortalRoot(portalRoot);

      return () => {
        // Clean up the portal root when the component unmounts
        shadowRootContainer.removeChild(portalRoot);
      };
    }
  }, []);

  if (!portalRoot) return null;

  return ReactDOM.createPortal(children, portalRoot);
};
