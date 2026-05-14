import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog/catalog-page";
import {
  filterProductsByCatalogFilters,
  getCatalogFilterOptions,
  parseFilterParam,
  parsePriceParam,
  serializeFilterParam,
  serializePriceParam,
} from "@/lib/catalog/catalog-filters";
import {
  filterProductsBySearchQuery,
  sanitizeSearchQuery,
} from "@/lib/catalog/catalog-search";
import { getCategoryBySlug } from "@/lib/catalog/get-categories";
import { parseProductSort } from "@/lib/catalog/types";
import { getProductsByCategoryFromDb } from "@/lib/catalog/get-products-db";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams?: Promise<{
    sort?: string;
    cores?: string;
    tamanhos?: string;
    precoMin?: string;
    precoMax?: string;
    q?: string;
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
  const selectedColors = parseFilterParam(query?.cores);
  const selectedSizes = parseFilterParam(query?.tamanhos);
  const selectedPriceMin = parsePriceParam(query?.precoMin);
  const selectedPriceMax = parsePriceParam(query?.precoMax);
  const searchQuery = sanitizeSearchQuery(query?.q);
  const productsByCategory = await getProductsByCategoryFromDb(category.slug, sort);
  const productsInContext = filterProductsBySearchQuery(productsByCategory, searchQuery);
  const products = filterProductsByCatalogFilters(productsInContext, {
    colors: selectedColors,
    sizes: selectedSizes,
    priceMin: selectedPriceMin,
    priceMax: selectedPriceMax,
  });
  const { colors: colorOptions, sizes: sizeOptions, priceBounds } =
    getCatalogFilterOptions(productsInContext);

  return (
    <CatalogPage
      basePath={category.href}
      breadcrumbs={[
        { label: "loja", href: "/produtos" },
        { label: category.name },
      ]}
      colorOptions={colorOptions}
      currentCategorySlug={category.slug}
      description={
        searchQuery
          ? `Resultados para "${searchQuery}" em ${category.name.toLowerCase()}.`
          : `Explore as peças de ${category.name.toLowerCase()} da Meliar.`
      }
      keepQuery={{
        q: searchQuery || undefined,
        cores: serializeFilterParam(selectedColors),
        tamanhos: serializeFilterParam(selectedSizes),
        precoMin: serializePriceParam(selectedPriceMin),
        precoMax: serializePriceParam(selectedPriceMax),
      }}
      products={products}
      selectedColors={selectedColors}
      selectedPriceMin={selectedPriceMin}
      selectedPriceMax={selectedPriceMax}
      selectedSizes={selectedSizes}
      sizeOptions={sizeOptions}
      priceBounds={priceBounds}
      sort={sort}
      title={category.name}
      variant="editorial"
    />
  );
}
