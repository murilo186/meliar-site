"use client";

import { createContext } from "react";
import type { CartItem, CartProductSelection } from "@/types/cart";

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  lastAddedSelectionId: string | null;
  lastAddedAt: number;
  addItem: (selection: CartProductSelection) => void;
  decreaseItem: (selectionId: string) => void;
  removeItem: (selectionId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
