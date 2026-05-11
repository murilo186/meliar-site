import { NextResponse } from "next/server";
import { getProductPrimaryImage } from "@/lib/catalog/get-products";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import {
  filterProductsBySearchQuery,
  sanitizeSearchQuery,
} from "@/lib/catalog/catalog-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = sanitizeSearchQuery(searchParams.get("q") ?? "");

  if (!query) {
    return NextResponse.json({
      query: "",
      totalMatches: 0,
      suggestions: [],
    });
  }

  const products = await getProductsFromDb("featured");
  const matchedProducts = filterProductsBySearchQuery(products, query);
  const suggestions = matchedProducts.slice(0, 5).map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.subcategory ?? product.category,
    price: product.price,
    image: getProductPrimaryImage(product),
    href: `/produto/${product.slug}`,
  }));

  return NextResponse.json({
    query,
    totalMatches: matchedProducts.length,
    suggestions,
  });
}

