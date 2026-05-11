import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { hasNewLabel } from "@/lib/catalog/new-arrivals-rule";
import type { Product } from "@/types/product";

function isHotProduct(product: Product) {
  if (product.isHot) {
    return true;
  }

  return hasNewLabel(product.label);
}

export async function getFeaturedHotProducts(limit = 8) {
  const safeLimit = Math.max(1, Math.min(12, Math.floor(limit)));
  const dbProducts = await getProductsFromDb("featured");
  return dbProducts.filter(isHotProduct).slice(0, safeLimit);
}
