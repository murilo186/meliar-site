import { products } from "@/data/products";

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
