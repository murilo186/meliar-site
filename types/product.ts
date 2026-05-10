export interface ProductVariant {
  slug: string;
  color: string;
  colorHex: string;
  images: string[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  isHot?: boolean;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  price: number;
  oldPrice?: number;
  label?: string;
  shortDescription: string;
  description: string;
  composition: string;
  fitNote?: string;
  sizes: string[];
  defaultVariantSlug?: string;
  variants: ProductVariant[];
}
