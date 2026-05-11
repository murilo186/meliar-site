import type { Product } from "@/types/product";

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function sanitizeSearchQuery(raw?: string) {
  return (raw ?? "").trim().slice(0, 80);
}

export function filterProductsBySearchQuery(products: Product[], query?: string) {
  const sanitizedQuery = sanitizeSearchQuery(query);
  if (!sanitizedQuery) {
    return products;
  }

  const normalizedQuery = normalizeSearchText(sanitizedQuery);

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.category,
      product.subcategory ?? "",
      product.shortDescription,
      product.description,
      product.composition,
      product.label ?? "",
      ...product.sizes,
      ...product.variants.map((variant) => variant.color),
    ].join(" ");

    return normalizeSearchText(haystack).includes(normalizedQuery);
  });
}

