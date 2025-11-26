import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addCartItem,
  clearCartRemote,
  createOrder,
  fetchCartItems,
  removeCartItem as removeCartItemRemote,
  updateCartItem as updateCartItemRemote,
} from "../lib/cartApi";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { productId, name, price_inr, quantity }
  const [couponCode, setCouponCode] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");

  useEffect(() => {
    fetchCartItems()
      .then((remoteItems) => {
        setItems(remoteItems);
      })
      .catch(() => {
        // ignore initial load errors in UI for now
      });
  }, []);

  const addToCart = async (product, quantity = 1) => {
    if (!product || !product.id) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: undefined,
          productId: product.id,
          name: product.name,
          price_inr: product.price_inr,
          quantity,
        },
      ];
    });

    try {
      const created = await addCartItem(product.id, quantity);
      setItems((prev) =>
        prev.map((item) =>
          item.productId === product.id && item.id === undefined
            ? { ...item, id: created.id }
            : item
        )
      );
    } catch {
      // rollback on error
      setItems((prev) =>
        prev
          .map((item) => {
            if (item.productId === product.id) {
              const newQty = item.quantity - quantity;
              if (newQty <= 0) return null;
              return { ...item, quantity: newQty };
            }
            return item;
          })
          .filter(Boolean)
      );
    }
  };

  const removeFromCart = async (productId) => {
    const current = items.find((i) => i.productId === productId);
    setItems((prev) => prev.filter((item) => item.productId !== productId));

    try {
      if (current?.id) {
        await removeCartItemRemote(current.id);
      }
    } catch {
      // ignore error and let UI stay optimistic
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const safeQty = Math.max(1, Number(quantity) || 1);
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQty } : item
      )
    );

    const current = items.find((i) => i.productId === productId);
    try {
      if (current?.id) {
        await updateCartItemRemote(current.id, safeQty);
      }
    } catch {
      // ignore error for now
    }
  };

  const clearCart = async () => {
    setItems([]);
    try {
      await clearCartRemote();
    } catch {
      // ignore
    }
  };

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.price_inr) || 0) * item.quantity,
        0
      ),
    [items]
  );

  // Simple, demonstrative discount logic only
  const discount = useMemo(() => {
    let value = 0;
    if (couponCode.trim().toUpperCase() === "GLOW10") {
      value += subtotal * 0.1;
    }
    if (giftCardCode.trim()) {
      // Support dynamic gift card amounts: pattern gift-card-<amount>
      const match = giftCardCode.match(/GIFT-CARD-(\d+)/i);
      if (match) {
        value += Number(match[1]);
      }
    }
    return Math.min(value, subtotal);
  }, [couponCode, giftCardCode, subtotal]);

  const discountedTotal = Math.max(0, subtotal - discount);

  const value = {
    items,
    couponCode,
    giftCardCode,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCouponCode,
    setGiftCardCode,
    clearCouponCode: () => setCouponCode(""),
    clearGiftCardCode: () => setGiftCardCode(""),
    subtotal,
    discountedTotal,
    discount,
    checkout: async () => {
      if (!items.length || discountedTotal <= 0) return null;
      const order = await createOrder(discountedTotal, items);
      await clearCart();
      return order;
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
