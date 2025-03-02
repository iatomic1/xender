import TipBtn from "@/components/tip-button";
import type React from "react";
import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

interface MessageInfo {
  element: Element;
  username: string;
  isInjected: boolean;
}

const DiscordButtonInjector: React.FC<{
  stxAddr: string;
  balance: any;
  isSignedId: boolean;
}> = ({ stxAddr, balance, isSignedId }) => {
  const [, forceUpdate] = useState({});
  const messagesRef = useRef<Map<Element, MessageInfo>>(new Map());

  const cleanDisplayName = (text: string): string => {
    const allowedCharactersRegex = /[^a-zA-Z\-_.]/g;
    return text.replace(allowedCharactersRegex, "");
  };

  const hasValidSuffix = (text: string): boolean => {
    const validSuffixes = [".btc", ".stx", ".id"];
    return validSuffixes.some((suffix) => text.endsWith(suffix));
  };

  useEffect(() => {
    const injectPlaceholders = () => {
      // console.log("1: Searching for messages");
      const messages = document.querySelectorAll(
        'li[class^="messageListItem"]',
      );
      let updated = false;

      messages.forEach((message) => {
        if (!messagesRef.current.has(message)) {
          const usernameElement = message.querySelector(
            'span[class^="username"]:not(div[id^="message-reply-context"] span)',
          );

          if (usernameElement) {
            // console.log("2: Found username element");
            const username = usernameElement.textContent;
            if (username) {
              // console.log("3: Username found:", username);
              const cleanedUsername = cleanDisplayName(username).toLowerCase();

              if (hasValidSuffix(cleanedUsername.trim())) {
                // console.log("4: Valid suffix found for:", cleanedUsername);
                const accessoriesElement = message.querySelector(
                  'div[id^="message-accessories-"]',
                );
                if (
                  accessoriesElement &&
                  !accessoriesElement.querySelector(".tip-button-placeholder")
                ) {
                  // console.log("5: Injecting placeholder into accessories div");
                  const placeholder = document.createElement("span");
                  placeholder.className = "tip-button-placeholder";
                  placeholder.style.display = "inline-block";
                  placeholder.style.width = "0";
                  placeholder.style.height = "0";
                  placeholder.style.overflow = "hidden";
                  accessoriesElement.appendChild(placeholder);

                  messagesRef.current.set(message, {
                    element: message,
                    username: cleanedUsername,
                    isInjected: false,
                  });
                  updated = true;
                }
              }
            }
          }
        }
      });

      if (updated) {
        forceUpdate({});
      }
    };

    const observer = new MutationObserver(injectPlaceholders);
    observer.observe(document.body, { childList: true, subtree: true });

    injectPlaceholders();

    return () => observer.disconnect();
  }, []); // Removed dependencies here

  return (
    <>
      {Array.from(messagesRef.current.entries()).map(
        ([message, messageInfo], index) => {
          const accessoriesElement = message.querySelector(
            'div[id^="message-accessories-"]',
          );
          if (
            accessoriesElement &&
            !accessoriesElement.querySelector(".injected-button")
          ) {
            return ReactDOM.createPortal(
              <TipBtn
                key={index}
                username={messageInfo.username}
                balance={balance}
                connectedStxAddr={stxAddr}
                receiverXUsername={"khoa"}
                senderXUsername="iatomic_1"
              />,
              accessoriesElement,
            );
          }
          return null;
        },
      )}
    </>
  );
};

export default DiscordButtonInjector;
