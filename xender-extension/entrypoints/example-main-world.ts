import { SUPPORTED_TOKENS } from "@/lib/constants";
import { addToCVValues, getPartsFromRows, nonEmptyPart } from "@/utils/tx";
import { messenger } from "@/lib/messaging";
import {
  openContractCall,
  openSTXTransfer,
  showConnect,
} from "@stacks/connect";
import { AppConfig, UserSession } from "@stacks/connect";
import {
  someCV,
  bufferCV,
  noneCV,
  Pc,
  uintCV,
  principalCV,
  PostConditionMode,
  listCV,
  tupleCV,
} from "@stacks/transactions";

function getLocalStoragePropertyDescriptor() {
  const iframe = document.createElement("iframe");
  document.head.append(iframe);
  const pd = Object.getOwnPropertyDescriptor(
    iframe.contentWindow,
    "localStorage",
  );
  iframe.remove();
  return pd;
}

export default defineUnlistedScript(async () => {
  const localStorageDescriptor = getLocalStoragePropertyDescriptor();
  if (localStorageDescriptor && localStorageDescriptor.get) {
    const localStorage = localStorageDescriptor.get.call(window);
    Object.defineProperty(window, "localStorage", {
      value: localStorage,
      writable: false,
      configurable: false,
    });
  } else {
    console.error(
      "Failed to restore localStorage: Property descriptor not found.",
    );
  }

  const appConfig = new AppConfig(["store_write", "publish_data"]);
  const userSession = new UserSession({ appConfig });

  // Add a small delay to ensure React has mounted
  setTimeout(() => {
    handleUserSession();
  }, 1000);

  const handleUserSession = () => {
    if (userSession.isUserSignedIn()) {
      try {
        const userData = userSession.loadUserData();
        console.log("User data loaded:", userData);
        messenger.sendMessage("userSession", {
          input: {
            isSignedIn: true,
            userData: userData,
          },
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
        messenger.sendMessage("userSession", {
          input: {
            isSignedIn: false,
            userData: null,
          },
        });
      }
    } else {
      messenger.sendMessage("userSession", {
        input: {
          isSignedIn: false,
          userData: null,
        },
      });
    }
  };

  messenger.onMessage("disconnectWallet", () => {
    userSession.signUserOut();
    handleUserSession();
  });

  messenger.onMessage("connectWallet", () => {
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

  messenger.onMessage("tipUsers", async (message) => {
    const { rows, currency, senderAddy, senderXProfile } = message.data;

    const { parts, total } = getPartsFromRows(rows);
    const updatedParts = await addToCVValues(parts);
    const nonEmptyParts = updatedParts.filter(nonEmptyPart);

    const transactionPromise = new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
        contractName: "send-many",
        functionName: "send-many",
        functionArgs: [
          listCV(
            nonEmptyParts.map((p) =>
              tupleCV({
                to: p.toCV!,
                ustx: uintCV(p.ustx),
              }),
            ),
          ),
        ],
        postConditions: [Pc.principal(senderAddy).willSendEq(total).ustx()],
        userSession,
        network: "mainnet",
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data) => {
          console.log(data);
          resolve({
            txId: data.txId,
            currency,
            senderAddy,
            senderXProfile,
            rows,
          });
        },
        onCancel: () => {
          reject(new Error("Transaction cancelled by user"));
        },
      });
    });

    try {
      const result = await transactionPromise;
      return result;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  });

  messenger.onMessage("tipUser", async (message) => {
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

      try {
        const result = await transactionPromise;
        return result;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      }
    } else {
      const txOptions = await constructTxOptions(
        Number(amount),
        address,
        `XENDER for ${username}`,
        {
          contract:
            currency === "MEME"
              ? SUPPORTED_TOKENS.MEME
              : SUPPORTED_TOKENS.VELAR,
          decimals: 6,
          ticker: currency === "MEME" ? "MEME" : "VELAR",
        },
        senderAddy,
      );

      const transactionPromise = new Promise((resolve, reject) => {
        openContractCall({
          userSession,
          ...txOptions,
          appDetails: {
            name: "Xender",
            icon: "/icon.png",
          },
          onFinish: (data) => {
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

const constructTxOptions = async (
  amount: number,
  receiverAddr: string,
  memo: string,
  tokenConfig: {
    decimals: number;
    contract: string;
    ticker: string;
  },
  senderAddy: string,
) => {
  if (!tokenConfig?.contract || !tokenConfig.contract.includes(".")) {
    console.log(
      "Invalid contract format. Expected 'contractAddress.contractName'",
    );
    throw new Error(
      "Invalid contract format. Expected 'contractAddress.contractName'",
    );
  }

  let memoCV;
  if (memo) {
    let memoBuffer = new TextEncoder().encode(memo);

    if (memoBuffer.length > 34) {
      memoBuffer = memoBuffer.slice(0, 34);
    } else if (memoBuffer.length < 34) {
      const padding = new Uint8Array(34 - memoBuffer.length).fill(0);
      memoBuffer = new Uint8Array([...memoBuffer, ...padding]);
    }

    memoCV = someCV(bufferCV(memoBuffer));
  } else {
    memoCV = noneCV();
  }

  const decimal = tokenConfig?.decimals ? tokenConfig.decimals : 6;
  // Ensure uintAmt is an integer by using Math.round instead of Math.floor
  const uintAmt = Math.round(amount * 10 ** decimal);

  const contract = tokenConfig.contract.split(".");

  const txOptions = {
    contractAddress: contract[0],
    contractName: contract[1],
    functionName: "transfer",
    postConditions: [
      Pc.principal(senderAddy)
        .willSendEq(uintAmt)
        .ft(`${contract[0]}.${contract[1]}`, tokenConfig.ticker),
    ],
    functionArgs: [
      uintCV(uintAmt.toString()),
      principalCV(senderAddy),
      principalCV(receiverAddr),
      memoCV,
    ],
    postConditionMode: PostConditionMode.Deny,
    validateWithAbi: true,
    network: "mainnet" as const,
  };

  return txOptions;
};
