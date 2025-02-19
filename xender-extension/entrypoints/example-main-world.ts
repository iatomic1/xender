import { showConnect } from "@stacks/connect";
import { AppConfig, UserSession } from "@stacks/connect";
export default defineUnlistedScript(async () => {
  const appConfig = new AppConfig(["store_write", "publish_data"]);
  const userSession = new UserSession({ appConfig });

  const handleUserSession = () => {
    if (userSession.isUserSignedIn()) {
      console.log("honored");
      const userData = userSession.loadUserData();
      window.postMessage(
        {
          type: "USER_SESSION_LOADED",
          data: {
            isSignedIn: true,
            userData: userData,
          },
        },
        "*",
      );
    } else {
      window.postMessage(
        {
          type: "USER_SESSION_LOADED",
          data: {
            isSignedIn: false,
          },
        },
        "*",
      );
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    handleUserSession();
  };

  handleUserSession();

  window.addEventListener("message", async (event) => {
    if (event.data.type === "CONNECT_WALLET") {
      console.log("Connect wallet button clicked");
      const myAppName = "Xender";

      showConnect({
        userSession,
        appDetails: {
          name: myAppName,
          icon: "/icon.png",
        },
        onFinish: () => {
          handleUserSession();
        },
        onCancel: () => {
          console.log("Connection cancelled FROM MAIN");
        },
      });
    }
    if (event.data.type === "DISCONNECT_WALLET") {
      disconnectWallet();
    }
  });
  console.log("Hello from the main world");
});
