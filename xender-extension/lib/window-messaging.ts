import { defineCustomEventMessaging } from "@webext-core/messaging/page";

type Transaction = {
  address: string;
  amount: number;
  currency: string;
  username: string;
  senderAddy: string;
  senderXProfile: string;
  receiverXProfile: string;
  txId?: string;
};

export interface WebsiteMessengerSchema {
  connectWallet(): void;
  disconnectWallet(): void;
  tipUser(data: Transaction): Transaction;
  userSession: {
    input: {
      isSignedIn: boolean;
      userData?: any;
    };
  };
}

export const websiteMessenger =
  defineCustomEventMessaging<WebsiteMessengerSchema>({
    namespace: "<somensd-unique-string>",
  });
