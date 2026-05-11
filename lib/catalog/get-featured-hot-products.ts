import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { HIGHLIGHT_PRODUCTS_LIMIT } from "@/lib/catalog/highlight-limits";
import type { Product } from "@/types/product";

function isHotProduct(product: Product) {
  return Boolean(product.isHot);
}

export async function getFeaturedHotProducts(limit = HIGHLIGHT_PRODUCTS_LIMIT) {
  const safeLimit = Math.max(1, Math.min(HIGHLIGHT_PRODUCTS_LIMIT, Math.floor(limit)));
  const dbProducts = await getProductsFromDb("featured");
  return dbProducts.filter(isHotProduct).slice(0, safeLimit);
}
