// messaging.ts
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  CONNECT_WALLET(data: unknown): void;
}

// Create the messaging protocol
export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
