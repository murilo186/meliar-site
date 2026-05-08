"use client";

import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import {
  CartContext,
  CartContextValue,
  CartItem,
  CartProductSelection,
} from "@/components/cart/cart-store";

const CART_STORAGE_KEY = "melier-cart-items";

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    try {
      const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);

      if (storedItems) {
        setItems(JSON.parse(storedItems) as CartItem[]);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      hasLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (selection: CartProductSelection) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.selection.id === selection.id,
      );

      if (!existingItem) {
        return [...currentItems, { selection, quantity: 1 }];
      }

      return currentItems.map((item) =>
        item.selection.id === selection.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    });
  };

  const decreaseItem = (selectionId: string) => {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.selection.id !== selectionId) {
          return item;
        }

        if (item.quantity <= 1) {
          return [];
        }

        return { ...item, quantity: item.quantity - 1 };
      }),
    );
  };

  const removeItem = (selectionId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.selection.id !== selectionId),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.selection.price * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotal,
      addItem,
      decreaseItem,
      removeItem,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
