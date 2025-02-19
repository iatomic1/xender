import { useEffect } from "react";
import "./App.module.css";
import "../../assets/main.css";
import { useTheme } from "@/components/theme-provider.tsx";
import { Button } from "@/components/ui/button";

export default () => {
  const { theme, toggleTheme } = useTheme();

  function domLoaded() {
    console.log("dom loaded");
  }

  useEffect(() => {
    if (document.readyState === "complete") {
      // load event has already fired, run your code or function here
      console.log("dom complete");
      domLoaded();
    } else {
      // load event hasn't fired, listen for it
      window.addEventListener("load", () => {
        // your code here
        console.log("content load:");
        console.log(window.location.href);
        domLoaded();
      });
    }
  }, []);

  return (
    <div className={theme}>
      <Button
        className="z-[99999999999999999999999999999] fixed bottom-4 right-4"
        size={"lg"}
        onClick={async () => {
          window.postMessage({ type: "CONNECT_WALLET" }, "*");
        }}
      >
        Connect Xender 1
      </Button>
    </div>
  );
};
