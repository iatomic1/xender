import { defineCustomEventMessaging } from "@webext-core/messaging/page";
import { Row } from "../utils/tx";

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

export const messenger = defineCustomEventMessaging<WebsiteMessengerSchema>({
  namespace: "<somensd-unique-string>",
});
