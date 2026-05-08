import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog/catalog-page";
import { getCategoryBySlug } from "@/lib/catalog/get-categories";
import { parseProductSort } from "@/lib/catalog/get-products";
import { getProductsByCategoryFromDb } from "@/lib/catalog/get-products-db";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams?: Promise<{
    sort?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const query = await searchParams;
  const sort = parseProductSort(query?.sort);
  const products = await getProductsByCategoryFromDb(category.slug, sort);

  return (
    <CatalogPage
      basePath={category.href}
      breadcrumbs={[
        { label: "loja", href: "/produtos" },
        { label: category.name },
      ]}
      currentCategorySlug={category.slug}
      description={`Explore as peças de ${category.name.toLowerCase()} da Meliar.`}
      products={products}
      sort={sort}
      title={category.name}
      variant="editorial"
    />
  );
}
