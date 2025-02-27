import TipBtn from "@/components/tip-button";
import { Button } from "@/components/ui/button";
import { XendCart, CartManager } from "@/lib/storage";
import { getOwner } from "bns-v2-sdk";
import { PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";

interface TweetInfo {
  element: Element;
  username: string;
  isInjected: boolean;
  receiverXUsername: string;
}

const TweetButtonInjector = ({
  stxAddr,
  balance,
  isSignedId,
}: {
  stxAddr: string;
  balance: any;
  isSignedId: boolean;
}) => {
  const [, forceUpdate] = useState({});
  const tweetsRef = useRef<Map<Element, TweetInfo>>(new Map());
  const [cartItems, setCartItems] = useState<XendCart[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCart = async () => {
      const cart = await CartManager.getCart();
      setCartItems(cart);
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const unsubscribe = CartManager.watchCart((newCart) => {
      setCartItems(newCart);
    });
    return () => unsubscribe();
  }, []);

  const cleanDisplayName = (text: string): string => {
    const allowedCharactersRegex = /[^a-zA-Z\-_.]/g;
    return text.replace(allowedCharactersRegex, "");
  };

  const hasValidSuffix = (text: string): boolean => {
    const validSuffixes = [".btc", ".stx", ".id"];
    return validSuffixes.some((suffix) => text.endsWith(suffix));
  };

  const getUsernameFromUrl = (url: string): string => {
    return url.replace(/^https?:\/\/(www\.)?x\.com\//, "");
  };

  const handleCartToggle = async (bns: string, xUsername: string) => {
    try {
      setLoading((prev) => ({ ...prev, [bns]: true }));

      const isInCart = await CartManager.isInCart(bns);

      if (isInCart) {
        const { cart } = await CartManager.toggleCartItem(bns, xUsername);
        setCartItems(cart);
      } else {
        try {
          const owner = await getOwner({
            fullyQualifiedName: bns,
            network: "mainnet",
          });

          if (owner) {
            const { cart } = await CartManager.toggleCartItem(
              bns,
              xUsername,
              owner,
            );
            setCartItems(cart);
          } else {
            // No owner found
            toast("Invalid BNS", {
              description: `${bns} does not have a valid owner on the Stacks network.`,
            });
          }
        } catch (error) {
          console.error("Error validating BNS:", error);
        }
      }
    } finally {
      // Clear loading state
      setLoading((prev) => ({ ...prev, [bns]: false }));
    }
  };

  // Check if an item is in the cart
  const isItemInCart = (bns: string): boolean => {
    return cartItems.some((item) => item.bns === bns);
  };

  useEffect(() => {
    const injectPlaceholders = () => {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');
      let updated = false;

      tweets.forEach((tweet) => {
        if (!tweetsRef.current.has(tweet)) {
          const userNameDiv = tweet.querySelector(
            'div[data-testid="User-Name"]',
          );
          if (userNameDiv) {
            const displayNameSpan = userNameDiv.querySelector(
              "span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3",
            );
            if (displayNameSpan) {
              const displayName = displayNameSpan.textContent;
              if (displayName) {
                const baseCleanedDisplayName = cleanDisplayName(displayName);
                const cleanedDisplayName = baseCleanedDisplayName.toLowerCase();

                if (hasValidSuffix(cleanedDisplayName.trim())) {
                  const receiverXProfile = userNameDiv.querySelector(
                    "a",
                  ) as HTMLLinkElement | null;
                  const receiverXUsername = getUsernameFromUrl(
                    receiverXProfile && (receiverXProfile.href as string),
                  );

                  const tweetActions = tweet.querySelector('[role="group"]');

                  if (
                    tweetActions &&
                    !tweetActions.querySelector(".tip-button-placeholder")
                  ) {
                    const placeholder = document.createElement("div");
                    placeholder.className = "tip-button-placeholder";
                    placeholder.style.width = "0";
                    placeholder.style.height = "0";
                    placeholder.style.overflow = "hidden";
                    tweetActions.appendChild(placeholder);

                    tweetsRef.current.set(tweet, {
                      element: tweet,
                      username: cleanedDisplayName,
                      receiverXUsername: receiverXUsername,
                      isInjected: false,
                    });
                    updated = true;
                  }
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
  }, [isSignedId]);

  return (
    <>
      {Array.from(tweetsRef.current.entries()).map(
        ([tweet, tweetInfo], index) => {
          const tweetActions = tweet.querySelector('[role="group"]');
          if (tweetActions && !tweetActions.querySelector(".injected-button")) {
            const isInCart = isItemInCart(tweetInfo.username);
            const isLoading = loading[tweetInfo.username] || false;

            return ReactDOM.createPortal(
              <>
                <TipBtn
                  key={index}
                  username={tweetInfo.username}
                  balance={balance}
                  connectedStxAddr={stxAddr}
                  receiverXUsername={tweetInfo.receiverXUsername}
                  senderXUsername="iatomic_1"
                />
                {!isInCart && (
                  <Button
                    size={"icon"}
                    className="ml-2"
                    disabled={isLoading}
                    onClick={() =>
                      handleCartToggle(
                        tweetInfo.username,
                        tweetInfo.receiverXUsername,
                      )
                    }
                  >
                    {isLoading ? (
                      <span className="animate-spin">⏳</span>
                    ) : isInCart ? (
                      <Trash2 size={17} strokeWidth={1.25} />
                    ) : (
                      <PlusCircle size={17} strokeWidth={1.25} />
                    )}
                  </Button>
                )}
              </>,
              tweetActions,
            );
          }
          return null;
        },
      )}
    </>
  );
};

export default TweetButtonInjector;
