import TipBtn from "@/components/tip-button";
import { useTweetObserver } from "@/hooks/useTweetObserver";
import { useCart } from "@/hooks/useXenderCart";
import ReactDOM from "react-dom";
import XendActions from "./xend-actions";

interface TweetButtonInjectorProps {
  stxAddr: string;
  balance: any;
  isSignedId: boolean;
}

const TweetButtonInjector: React.FC<TweetButtonInjectorProps> = ({
  stxAddr,
  balance,
  isSignedId,
}) => {
  const tweetsRef = useTweetObserver(isSignedId);
  const { cartItems, loading, handleCartToggle, isItemInCart } = useCart();

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
                <XendActions
                  isInCart={isInCart}
                  isLoading={isLoading}
                  onToggle={() =>
                    handleCartToggle(
                      tweetInfo.username,
                      tweetInfo.receiverXUsername,
                    )
                  }
                />
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
