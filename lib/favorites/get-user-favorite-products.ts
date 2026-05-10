import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

type FavoriteRow = {
  product_slug: string;
  created_at: string;
};

export async function getUserFavoriteProducts(userId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_favorites")
    .select("product_slug,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  const favoriteRows = (data ?? []) as FavoriteRow[];
  if (favoriteRows.length === 0) {
    return [];
  }

  const allProducts = await getProductsFromDb("featured");
  const productBySlug = new Map(allProducts.map((product) => [product.slug, product] as const));

  return favoriteRows
    .map((row) => productBySlug.get(row.product_slug))
    .filter((product): product is Product => Boolean(product));
}
