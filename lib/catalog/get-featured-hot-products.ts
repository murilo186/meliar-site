import { getProducts } from "@/lib/catalog/get-products";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import type { Product } from "@/types/product";

function isHotProduct(product: Product) {
  if (product.isHot) {
    return true;
  }

  return product.label?.trim().toLowerCase() === "novo";
}

export async function getFeaturedHotProducts(limit = 8) {
  const safeLimit = Math.max(1, Math.min(12, Math.floor(limit)));

  try {
    const dbProducts = await getProductsFromDb("featured");
    return dbProducts.filter(isHotProduct).slice(0, safeLimit);
  } catch {
    return getProducts("featured").filter(isHotProduct).slice(0, safeLimit);
  }
}
