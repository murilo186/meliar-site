import { CatalogPage } from "@/components/catalog/catalog-page";
import { parseProductSort } from "@/lib/catalog/get-products";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";
import { hasNewLabel } from "@/lib/catalog/new-arrivals-rule";

interface ProductsPageProps {
  searchParams?: Promise<{
    sort?: string;
    novos?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const sort = parseProductSort(params?.sort);
  const showOnlyNew = params?.novos === "1";
  const products = await getProductsFromDb(sort);
  const productsWithNewFirst = [...products].sort((left, right) => {
    const leftIsNew = hasNewLabel(left.label) ? 1 : 0;
    const rightIsNew = hasNewLabel(right.label) ? 1 : 0;
    return rightIsNew - leftIsNew;
  });
  const visibleProducts = showOnlyNew
    ? productsWithNewFirst.filter((product) => hasNewLabel(product.label))
    : productsWithNewFirst;

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
      keepQuery={{ novos: showOnlyNew ? "1" : undefined }}
      products={visibleProducts}
      sort={sort}
      title="Produtos"
      variant="editorial"
    />
  );
}
