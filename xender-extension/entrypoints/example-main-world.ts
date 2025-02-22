import { websiteMessenger } from "@/lib/window-messaging";
import { openSTXTransfer, showConnect } from "@stacks/connect";
import { AppConfig, UserSession } from "@stacks/connect";
import { number } from "zod";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default defineUnlistedScript(async () => {
  // Add a small delay to ensure React has mounted
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

  websiteMessenger.onMessage("tipUser", async (message) => {
    const {
      address,
      amount,
      currency,
      username,
      senderAddy,
      senderXProfile,
      receiverXProfile,
    } = message.data;
    console.log(message.data);
    const numAmt = amount * 1_000_000;

    if (currency === "STX") {
      const transactionPromise = new Promise((resolve, reject) => {
        openSTXTransfer({
          recipient: address,
          amount: numAmt.toString(),
          memo: `XENDER for ${username}`,
          network: "mainnet",
          appDetails: {
            name: "Xender",
            icon: "/icon.png",
          },
          onFinish: (data) => {
            console.log("Transaction ID:", data.txId);
            console.log("Raw transaction:", data.txRaw);
            resolve({
              txId: data.txId,
              address,
              amount,
              currency,
              username,
              senderAddy,
              senderXProfile,
              receiverXProfile,
            });
          },
          onCancel: () => {
            reject(new Error("Transaction cancelled by user"));
          },
        });
      });

      // Wait for the promise to resolve or reject
      try {
        const result = await transactionPromise;
        return result;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      }
    }
  });
});
