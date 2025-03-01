import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getOwner } from "bns-v2-sdk";
import TipBtn from "@/components/tip-button";

export default function ProfileButtonInjector({
  username,
  balance,
  stxAddr,
}: {
  username: string;
  balance: any;
  stxAddr: string;
}) {
  const [profileTargetEl, setProfileTargetEl] = useState<HTMLElement | null>(
    null,
  );
  const [bns, setBns] = useState<string | null>(null);

  useEffect(() => {
    const findProfileElement = async () => {
      const selectors = ['div[data-testid="UserName"]'];

      for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          const displayNameSpan = element.querySelector(
            "span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3",
          );
          if (displayNameSpan) {
            const displayName = displayNameSpan.textContent;
            if (displayName) {
              const baseCleanedDisplayName = cleanDisplayName(displayName);
              const cleanedDisplayName = baseCleanedDisplayName.toLowerCase();

              if (hasValidSuffix(cleanedDisplayName.trim())) {
                console.log("good to go");

                const owner = await getOwner({
                  fullyQualifiedName: cleanedDisplayName.trim(),
                  network: "mainnet",
                });

                if (owner) {
                  element.style.flexDirection = "row";
                  element.style.justifyContent = "space-between";
                  setProfileTargetEl(element);
                  setBns(cleanedDisplayName.trim());
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    };

    const startObserver = async () => {
      const found = await findProfileElement();
      if (!found) {
        const observer = new MutationObserver(async (mutations) => {
          if (await findProfileElement()) {
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-testid"],
        });

        setTimeout(async () => {
          if (await findProfileElement()) {
            observer.disconnect();
          }
        }, 1500);

        return () => observer.disconnect();
      }
    };

    startObserver();
  }, []);

  return profileTargetEl
    ? createPortal(
        <TipBtn
          username={bns as string}
          balance={balance}
          connectedStxAddr={stxAddr}
          receiverXUsername={username}
          senderXUsername="iatomic_1"
          className="self-end"
        />,
        profileTargetEl,
      )
    : null;
}
