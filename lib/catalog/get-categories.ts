import { catalogCategories } from "@/lib/catalog/category-data";

export function getCategories() {
  return catalogCategories;
}

export function getCategoryBySlug(categorySlug: string) {
  return catalogCategories.find((category) => category.slug === categorySlug);
}

export function getSubcategoryBySlugs(
  categorySlug: string,
  subcategorySlug: string,
) {
  const category = getCategoryBySlug(categorySlug);

  if (!category?.children) {
    return null;
  }

  return category.children.find((subcategory) => subcategory.slug === subcategorySlug);
}
