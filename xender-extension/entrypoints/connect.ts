import { websiteMessenger } from "@/lib/window-messaging";
import { showConnect } from "@stacks/connect";
import { AppConfig, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default defineUnlistedScript(async () => {
  setTimeout(() => {
    handleUserSession();
  }, 1000);

  const handleUserSession = () => {
    if (userSession.isUserSignedIn()) {
      try {
        const userData = userSession.loadUserData();
        console.log("User data loaded:", userData);
        websiteMessenger.sendMessage("userSession", {
          input: {
            isSignedIn: true,
            userData: userData,
          },
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
        websiteMessenger.sendMessage("userSession", {
          input: {
            isSignedIn: false,
            userData: null,
          },
        });
      }
    } else {
      websiteMessenger.sendMessage("userSession", {
        input: {
          isSignedIn: false,
          userData: null,
        },
      });
    }
  };

  websiteMessenger.onMessage("disconnectWallet", () => {
    userSession.signUserOut();
    handleUserSession();
  });

  websiteMessenger.onMessage("connectWallet", () => {
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
  });
});
