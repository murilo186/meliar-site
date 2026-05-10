import { CatalogPage } from "@/components/catalog/catalog-page";
import {
  filterProductsByCatalogFilters,
  getCatalogFilterOptions,
  parseFilterParam,
  parsePriceParam,
  serializeFilterParam,
  serializePriceParam,
} from "@/lib/catalog/catalog-filters";
import { parseProductSort } from "@/lib/catalog/get-products";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { hasNewLabel } from "@/lib/catalog/new-arrivals-rule";

interface ProductsPageProps {
  searchParams?: Promise<{
    sort?: string;
    novos?: string;
    cores?: string;
    tamanhos?: string;
    precoMin?: string;
    precoMax?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const sort = parseProductSort(params?.sort);
  const showOnlyNew = params?.novos === "1";
  const selectedColors = parseFilterParam(params?.cores);
  const selectedSizes = parseFilterParam(params?.tamanhos);
  const selectedPriceMin = parsePriceParam(params?.precoMin);
  const selectedPriceMax = parsePriceParam(params?.precoMax);
  const products = await getProductsFromDb(sort);
  const productsWithNewFirst = [...products].sort((left, right) => {
    const leftIsNew = hasNewLabel(left.label) ? 1 : 0;
    const rightIsNew = hasNewLabel(right.label) ? 1 : 0;
    return rightIsNew - leftIsNew;
  });
  const productsInContext = showOnlyNew
    ? productsWithNewFirst.filter((product) => hasNewLabel(product.label))
    : productsWithNewFirst;
  const visibleProducts = filterProductsByCatalogFilters(productsInContext, {
    colors: selectedColors,
    sizes: selectedSizes,
    priceMin: selectedPriceMin,
    priceMax: selectedPriceMax,
  });
  const { colors: colorOptions, sizes: sizeOptions, priceBounds } =
    getCatalogFilterOptions(productsInContext);

  return (
    <CatalogPage
      basePath="/produtos"
      breadcrumbs={[
        { label: "loja", href: "/produtos" },
        { label: "produtos" },
      ]}
      description={
        showOnlyNew
          ? "Mostrando peças marcadas como Novo na coleção atual da Meliar."
          : "Veja todas as peças disponíveis da coleção atual da Meliar."
      }
      colorOptions={colorOptions}
      keepQuery={{
        novos: showOnlyNew ? "1" : undefined,
        cores: serializeFilterParam(selectedColors),
        tamanhos: serializeFilterParam(selectedSizes),
        precoMin: serializePriceParam(selectedPriceMin),
        precoMax: serializePriceParam(selectedPriceMax),
      }}
      products={visibleProducts}
      selectedColors={selectedColors}
      selectedPriceMin={selectedPriceMin}
      selectedPriceMax={selectedPriceMax}
      selectedSizes={selectedSizes}
      sizeOptions={sizeOptions}
      priceBounds={priceBounds}
      sort={sort}
      title="Produtos"
      variant="editorial"
    />
  );
}
