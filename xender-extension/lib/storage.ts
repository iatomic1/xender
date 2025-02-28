import { storage } from "wxt/storage";

export type XendCart = {
  bns: string;
  createdAt: string;
  xUsername: string;
  ownerAddress?: string;
};

export const xendCart = storage.defineItem<XendCart[]>("local:xendCart", {
  fallback: [],
  version: 1,
});

export const CartManager = {
  async getCart(): Promise<XendCart[]> {
    return await xendCart.getValue();
  },

  async isInCart(bns: string): Promise<boolean> {
    const cart = await this.getCart();
    return cart.some((item) => item.bns === bns);
  },

  async addToCart(
    bns: string,
    xUsername: string,
    ownerAddress?: string,
  ): Promise<XendCart[]> {
    const cart = await this.getCart();
    if (cart.some((item) => item.bns === bns)) {
      return cart;
    }

    const newItem: XendCart = {
      bns,
      createdAt: new Date().toISOString(),
      xUsername,
      ownerAddress,
    };

    const updatedCart = [...cart, newItem];
    await xendCart.setValue(updatedCart);
    return updatedCart;
  },

  async removeFromCart(bns: string): Promise<XendCart[]> {
    const cart = await this.getCart();
    const updatedCart = cart.filter((item) => item.bns !== bns);
    await xendCart.setValue(updatedCart);
    return updatedCart;
  },

  async toggleCartItem(
    bns: string,
    xUsername: string,
    ownerAddress?: string,
  ): Promise<{ inCart: boolean; cart: XendCart[] }> {
    const isInCart = await this.isInCart(bns);
    if (isInCart) {
      const cart = await this.removeFromCart(bns);
      return { inCart: false, cart };
    } else {
      const cart = await this.addToCart(bns, xUsername, ownerAddress);
      return { inCart: true, cart };
    }
  },

  async clearCart(): Promise<void> {
    await xendCart.setValue([]);
  },

  watchCart(callback: (newCart: XendCart[], oldCart: XendCart[]) => void) {
    return xendCart.watch(callback);
  },
};
