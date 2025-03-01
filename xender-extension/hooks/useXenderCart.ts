import { useState, useEffect } from "react";
import { XendCart, CartManager } from "@/lib/storage";
import { getOwner } from "bns-v2-sdk";
import { toast } from "sonner";

export const useCart = () => {
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

  const isItemInCart = (bns: string): boolean => {
    return cartItems.some((item) => item.bns === bns);
  };

  return {
    cartItems,
    loading,
    handleCartToggle,
    isItemInCart,
  };
};
