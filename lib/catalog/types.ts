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
