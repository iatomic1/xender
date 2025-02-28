import { defineCustomEventMessaging } from "@webext-core/messaging/page";
import { XendCart } from "./storage";
import { Row } from "./tx";

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

export type TransactionUsers = {
  rows: Row[];
  // items: XendCart[];
  // amount: number;
  currency: string;
  senderAddy: string;
  senderXProfile: string;
  txId?: string;
};

export interface WebsiteMessengerSchema {
  connectWallet(): void;
  disconnectWallet(): void;
  tipUser(data: Transaction): Transaction;
  tipUsers(data: TransactionUsers): TransactionUsers;
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
