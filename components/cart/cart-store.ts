"use client";

import { createContext } from "react";

export interface CartProductSelection {
  id: string;
  productId: number;
  productSlug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
}

export interface CartItem {
  selection: CartProductSelection;
  quantity: number;
}

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
