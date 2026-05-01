import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog/catalog-page";
import { getCategoryBySlug, getSubcategoryBySlugs } from "@/lib/catalog/get-categories";
import { getProductsBySubcategory, parseProductSort } from "@/lib/catalog/get-products";

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
  searchParams?: Promise<{
    sort?: string;
  }>;
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const subcategory = getSubcategoryBySlugs(categorySlug, subcategorySlug);

  if (!category || !subcategory) {
    notFound();
  }

  const query = await searchParams;
  const sort = parseProductSort(query?.sort);
  const products = getProductsBySubcategory(category.slug, subcategory.slug, sort);

  return (
    <CatalogPage
      basePath={subcategory.href}
      breadcrumbs={[
        { label: "loja", href: "/produtos" },
        { label: category.name.toLowerCase(), href: category.href },
        { label: subcategory.name.toLowerCase() },
      ]}
      currentCategorySlug={category.slug}
      currentSubcategorySlug={subcategory.slug}
      description={`Seleção de ${subcategory.name.toLowerCase()} dentro de ${category.name.toLowerCase()}.`}
      products={products}
      sort={sort}
      title={subcategory.name}
      variant="editorial"
    />
  );
}
