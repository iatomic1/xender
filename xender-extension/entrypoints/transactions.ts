import { websiteMessenger } from "@/lib/window-messaging";
import { openSTXTransfer } from "@stacks/connect";

export default defineUnlistedScript(async () => {
  websiteMessenger.onMessage("tipUser", async (message) => {
    console.log("fired");
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
