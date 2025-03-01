import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface TweetButtonProps {
  isInCart: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

const XendActions: React.FC<TweetButtonProps> = ({
  isInCart,
  isLoading,
  onToggle,
}) => {
  if (isInCart) return null;

  return (
    <Button
      size={"icon"}
      className="ml-2"
      disabled={isLoading}
      onClick={onToggle}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : isInCart ? (
        <Trash2 size={17} strokeWidth={1.25} />
      ) : (
        <PlusCircle size={17} strokeWidth={1.25} />
      )}
    </Button>
  );
};

export default XendActions;
