import { useState, useEffect } from "react";

export const useHostname = () => {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    const checkHostname = () => {
      const hostname = window.location.hostname;
      setHostname(hostname);
    };

    checkHostname();
    window.addEventListener("popstate", checkHostname);

    return () => {
      window.removeEventListener("popstate", checkHostname);
    };
  }, []);

  return hostname;
};
