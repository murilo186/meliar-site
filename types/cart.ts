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
