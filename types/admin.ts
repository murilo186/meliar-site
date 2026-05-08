export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  displayName: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  priceCents: number;
  oldPriceCents: number | null;
  isVisible: boolean;
  isHot: boolean;
  showInNewArrivalsManual: boolean;
  createdAt: string;
  imagesCount: number;
  hasVariantWithoutImage: boolean;
}

export interface AdminStockRow {
  id: string;
  sku: string;
  stock_quantity: number;
  is_available: boolean;
  products: { name: string } | { name: string }[] | null;
  product_id: string;
  colors: { name: string } | { name: string }[] | null;
  sizes: { name: string } | { name: string }[] | null;
}

export type AdminSalesStatus =
  | "open"
  | "paid"
  | "in_delivery"
  | "finished"
  | "cancelled";

export interface AdminSalesItem {
  id: string;
  productName: string;
  variantLabel: string;
  imageUrl: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface AdminSalesOrder {
  id: string;
  orderNumber: string;
  status: AdminSalesStatus;
  channel: "whatsapp" | "manual";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  totalCents: number;
  notes?: string;
  items: AdminSalesItem[];
}

export interface AdminSalesOrderSummary {
  id: string;
  orderNumber: string;
  status: AdminSalesStatus;
  channel: "whatsapp" | "manual";
  customerName: string;
  customerPhone: string;
  createdAt: string;
  totalCents: number;
  itemsCount: number;
}
