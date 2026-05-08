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
