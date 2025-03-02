import { LockOpen, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { XendCart, CartManager } from "@/lib/storage";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import XendMany from "./xend-many";

export default function CartSheet({
  balance,
  address,
}: {
  balance: any;
  address: string;
}) {
  const [cartItems, setCartItems] = useState<XendCart[]>([]);
  const [selectedItems, setSelectedItems] = useState<XendCart[]>([]);

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
      setSelectedItems((prev) =>
        prev.filter((selectedItem) =>
          newCart.some((cartItem) => cartItem.bns === selectedItem.bns),
        ),
      );
    });
    return () => unsubscribe();
  }, []);

  const handleRemoveFromCart = async (bns: string) => {
    const updatedCart = await CartManager.removeFromCart(bns);
    setCartItems(updatedCart);
    setSelectedItems((prev) => prev.filter((item) => item.bns !== bns));
  };

  const handleSelectItem = (item: XendCart, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, item]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((selected) => selected.bns !== item.bns),
      );
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...cartItems]);
    }
  };

  const formatAddress = (address?: string): string => {
    if (!address) return "Unknown address";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full mt-10">
          <ShoppingBag size={17} />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[400px] sm:w-[540px] flex flex-col h-full"
        side="right"
      >
        <div className="flex-none">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-2xl font-bold">Xender Cart</SheetTitle>
            <SheetDescription>Your Xender Cart</SheetDescription>
          </SheetHeader>

          {cartItems.length > 0 && (
            <div className="flex items-center mb-3">
              <Checkbox
                id="selectAll"
                checked={
                  cartItems.length > 0 &&
                  selectedItems.length === cartItems.length
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="selectAll"
                className="ml-2 text-sm cursor-pointer"
              >
                Select All
              </label>
              <span className="ml-auto text-sm text-gray-500">
                {selectedItems.length} of {cartItems.length} selected
              </span>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-gray-500">Your cart is empty.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mr-4 pr-4 overflow-y-auto">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.bns}
                  className="flex items-center p-4 border rounded-lg"
                >
                  <Checkbox
                    id={`item-${item.bns}`}
                    checked={selectedItems.some(
                      (selected) => selected.bns === item.bns,
                    )}
                    onCheckedChange={(checked) =>
                      handleSelectItem(item, checked === true)
                    }
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.bns}</p>
                    <p className="text-sm text-gray-500">@{item.xUsername} </p>
                    {item.ownerAddress && (
                      <p className="text-xs text-blue-500">
                        {formatAddress(item.ownerAddress)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Added on: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFromCart(item.bns)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex-none mt-6">
          <SheetFooter className="gap-2">
            <XendMany items={cartItems} balance={balance} address={address}>
              <Button
                className="w-full"
                disabled={cartItems.length === 0}
                onClick={() => {
                  console.log(cartItems);
                }}
              >
                Xend All ({cartItems.length})
              </Button>
            </XendMany>
            <XendMany items={selectedItems} balance={balance} address={address}>
              <Button
                className="w-full"
                disabled={selectedItems.length === 0}
                onClick={() => {
                  console.log(selectedItems);
                }}
              >
                Xend Selected ({selectedItems.length})
              </Button>
            </XendMany>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
