import { NextResponse } from "next/server";
import { z } from "zod";
import { filterProductsBySearchQuery, sanitizeSearchQuery } from "@/lib/catalog/catalog-search";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { getProductPrimaryImage } from "@/lib/catalog/product-ui-helpers";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const searchParamsSchema = z.object({
  q: z.string().max(100).optional().default(""),
});

export async function GET(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "catalog-search");
  if (!checkRateLimit(rateLimitKey, { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = searchParamsSchema.safeParse({
    q: searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const query = sanitizeSearchQuery(parsed.data.q);

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
    image: getProductPrimaryImage(product) ?? null,
    href: `/produto/${product.slug}`,
  }));

  return NextResponse.json({
    query,
    totalMatches: matchedProducts.length,
    suggestions,
  });
}
