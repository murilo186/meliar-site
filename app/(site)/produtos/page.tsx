import { CatalogPage } from "@/components/catalog/catalog-page";
import { parseProductSort } from "@/lib/catalog/get-products";
import { getProductsFromDb } from "@/lib/catalog/get-products-db";

interface ProductsPageProps {
  searchParams?: Promise<{
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const sort = parseProductSort(params?.sort);
  const products = await getProductsFromDb(sort);

  return (
    <CatalogPage
      basePath="/produtos"
      breadcrumbs={[
        { label: "loja", href: "/produtos" },
        { label: "novidades" },
      ]}
      description="Veja todas as peças disponíveis da coleção atual da Meliar."
      products={products}
      sort={sort}
      title="Novidades"
      variant="editorial"
    />
  );
}
