import { CatalogBreadcrumbs } from "@/components/catalog/catalog-breadcrumbs";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { CatalogSidebar } from "@/components/catalog/catalog-sidebar";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import type { ProductSort } from "@/lib/catalog/get-products";
import type { BreadcrumbItem } from "@/types/catalog";
import type { Product } from "@/types/product";

interface CatalogPageProps {
  title: string;
  description?: string;
  products: Product[];
  breadcrumbs: BreadcrumbItem[];
  sort: ProductSort;
  basePath: string;
  currentCategorySlug?: string;
  currentSubcategorySlug?: string;
  variant?: "default" | "editorial";
}

export function CatalogPage({
  title,
  description,
  products,
  breadcrumbs,
  sort,
  basePath,
  currentCategorySlug,
  currentSubcategorySlug,
  variant = "default",
}: CatalogPageProps) {
  if (variant === "editorial") {
    return (
      <section className="bg-white py-6 sm:py-8">
        <div className="container">
          <CatalogBreadcrumbs items={breadcrumbs} />
          <CatalogToolbar
            basePath={basePath}
            count={products.length}
            description={description}
            sort={sort}
            title={title}
            variant="editorial"
          />
          <div className="mt-6">
            <CatalogGrid products={products} variant="editorial" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fcfbf9] py-6 sm:py-8">
      <div className="container">
        <CatalogBreadcrumbs items={breadcrumbs} />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <CatalogSidebar
            currentCategorySlug={currentCategorySlug}
            currentSubcategorySlug={currentSubcategorySlug}
          />

          <div className="min-w-0 flex-1">
            <CatalogToolbar
              basePath={basePath}
              count={products.length}
              description={description}
              sort={sort}
              title={title}
            />

            <div className="mt-4">
              <CatalogGrid products={products} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
