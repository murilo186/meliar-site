export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  price: number;
  oldPrice?: number;
  image: string;
  label?: string;
  color: string;
}
