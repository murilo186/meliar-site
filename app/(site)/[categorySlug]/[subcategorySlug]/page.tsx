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
import { getCategoryBySlug, getSubcategoryBySlugs } from "@/lib/catalog/get-categories";
import { parseProductSort } from "@/lib/catalog/types";
import { getProductsBySubcategoryFromDb } from "@/lib/catalog/get-products-db";

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
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
  const selectedColors = parseFilterParam(query?.cores);
  const selectedSizes = parseFilterParam(query?.tamanhos);
  const selectedPriceMin = parsePriceParam(query?.precoMin);
  const selectedPriceMax = parsePriceParam(query?.precoMax);
  const searchQuery = sanitizeSearchQuery(query?.q);
  const productsBySubcategory = await getProductsBySubcategoryFromDb(
    category.slug,
    subcategory.slug,
    sort,
  );
  const productsInContext = filterProductsBySearchQuery(
    productsBySubcategory,
    searchQuery,
  );
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
      basePath={subcategory.href}
      breadcrumbs={[
        { label: "loja", href: "/produtos" },
        { label: category.name.toLowerCase(), href: category.href },
        { label: subcategory.name.toLowerCase() },
      ]}
      colorOptions={colorOptions}
      currentCategorySlug={category.slug}
      currentSubcategorySlug={subcategory.slug}
      description={
        searchQuery
          ? `Resultados para "${searchQuery}" em ${subcategory.name.toLowerCase()}.`
          : `Seleção de ${subcategory.name.toLowerCase()} dentro de ${category.name.toLowerCase()}.`
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
      title={subcategory.name}
      variant="editorial"
    />
  );
}
