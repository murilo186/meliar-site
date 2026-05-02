import { products } from "@/data/products";
import type { Product, ProductVariant } from "@/types/product";

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export function parseProductSort(value?: string): ProductSort {
  const allowedSorts: ProductSort[] = [
    "featured",
    "price-asc",
    "price-desc",
    "name-asc",
    "name-desc",
  ];

  if (value && allowedSorts.includes(value as ProductSort)) {
    return value as ProductSort;
  }

  return "featured";
}

function sortProducts(sort: ProductSort) {
  return [...products].sort((left, right) => {
    switch (sort) {
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "name-asc":
        return left.name.localeCompare(right.name, "pt-BR");
      case "name-desc":
        return right.name.localeCompare(left.name, "pt-BR");
      case "featured":
      default:
        return 0;
    }
  });
}

export function getProducts(sort: ProductSort = "featured") {
  return sortProducts(sort);
}

export function getFeaturedProducts(limit = 6) {
  return products.slice(0, limit);
}

export function getProductsByCategory(
  categorySlug: string,
  sort: ProductSort = "featured",
) {
  return sortProducts(sort).filter((product) => product.categorySlug === categorySlug);
}

export function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
  sort: ProductSort = "featured",
) {
  return sortProducts(sort).filter(
    (product) =>
      product.categorySlug === categorySlug &&
      product.subcategorySlug === subcategorySlug,
  );
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        (item.subcategorySlug === product.subcategorySlug ||
          item.categorySlug === product.categorySlug),
    )
    .slice(0, limit);
}

export function getDefaultVariant(product: Product): ProductVariant {
  const variant =
    product.variants.find((item) => item.slug === product.defaultVariantSlug) ??
    product.variants[0];

  if (!variant) {
    throw new Error(`Product ${product.slug} does not have variants.`);
  }

  return variant;
}

export function getVariantBySlug(product: Product, variantSlug?: string) {
  return (
    product.variants.find((variant) => variant.slug === variantSlug) ??
    getDefaultVariant(product)
  );
}

export function getProductPrimaryImage(product: Product, variantSlug?: string) {
  return getVariantBySlug(product, variantSlug).images[0];
}
