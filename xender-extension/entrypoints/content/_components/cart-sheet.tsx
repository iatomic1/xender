import { LockOpen, Trash2 } from "lucide-react"; // Import Trash2 for the delete icon
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { XendCart, CartManager } from "@/lib/storage";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CartSheet() {
  const [cartItems, setCartItems] = useState<XendCart[]>([]); // State to track cart items

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCart = async () => {
      const cart = await CartManager.getCart();
      setCartItems(cart);
    };
    fetchCart();
  }, []);

  // Watch for changes in the cart
  useEffect(() => {
    const unsubscribe = CartManager.watchCart((newCart) => {
      setCartItems(newCart);
    });
    return () => unsubscribe();
  }, []);

  // Handle removing an item from the cart
  const handleRemoveFromCart = async (bns: string) => {
    const updatedCart = await CartManager.removeFromCart(bns);
    setCartItems(updatedCart);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full mt-10">
          <LockOpen size={17} />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[400px] sm:w-[540px] overflow-y-auto"
        side="right"
      >
        <ScrollArea>
          <SheetHeader className="pb-6">
            <SheetTitle className="text-2xl font-bold">Xender Cart</SheetTitle>
            <SheetDescription>Your Xender Cart</SheetDescription>
          </SheetHeader>

          {/* Display cart items */}
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.bns}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.bns}</p>
                    <p className="text-sm text-gray-500">{item.xUsername}</p>
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
              ))
            )}
          </div>

          <SheetClose asChild>
            <Button className="mt-6 w-full" variant="outline">
              Tip All
            </Button>
          </SheetClose>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
