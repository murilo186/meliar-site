import { CatalogBreadcrumbs } from "@/components/catalog/catalog-breadcrumbs";
import { CatalogDesktopFilters } from "@/components/catalog/catalog-desktop-filters";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { CatalogMobileFilters } from "@/components/catalog/catalog-mobile-filters";
import { CatalogSidebar } from "@/components/catalog/catalog-sidebar";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import type {
  CatalogFilterOption,
  CatalogPriceBounds,
} from "@/lib/catalog/catalog-filters";
import type { ProductSort } from "@/lib/catalog/types";
import type { BreadcrumbItem } from "@/types/catalog";
import type { Product } from "@/types/product";

interface CatalogPageProps {
  title: string;
  description?: string;
  products: Product[];
  breadcrumbs: BreadcrumbItem[];
  sort: ProductSort;
  basePath: string;
  keepQuery?: Record<string, string | undefined>;
  currentCategorySlug?: string;
  currentSubcategorySlug?: string;
  selectedColors?: string[];
  selectedSizes?: string[];
  selectedPriceMin?: number;
  selectedPriceMax?: number;
  colorOptions?: CatalogFilterOption[];
  sizeOptions?: CatalogFilterOption[];
  priceBounds?: CatalogPriceBounds;
  variant?: "default" | "editorial";
}

export function CatalogPage({
  title,
  description,
  products,
  breadcrumbs,
  sort,
  basePath,
  keepQuery,
  currentCategorySlug,
  currentSubcategorySlug,
  selectedColors = [],
  selectedSizes = [],
  selectedPriceMin,
  selectedPriceMax,
  colorOptions = [],
  sizeOptions = [],
  priceBounds = { min: 0, max: 0 },
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
            keepQuery={keepQuery}
            sort={sort}
            title={title}
            variant="editorial"
          />
          <div className="mt-4">
            <CatalogMobileFilters
              basePath={basePath}
              colorOptions={colorOptions}
              count={products.length}
              keepQuery={keepQuery}
              selectedColors={selectedColors}
              selectedSizes={selectedSizes}
              selectedPriceMin={selectedPriceMin}
              selectedPriceMax={selectedPriceMax}
              sizeOptions={sizeOptions}
              priceBounds={priceBounds}
              sort={sort}
            />
          </div>

          <div className="mt-4">
            <CatalogDesktopFilters
              basePath={basePath}
              colorOptions={colorOptions}
              count={products.length}
              keepQuery={keepQuery}
              selectedColors={selectedColors}
              selectedSizes={selectedSizes}
              selectedPriceMin={selectedPriceMin}
              selectedPriceMax={selectedPriceMax}
              sizeOptions={sizeOptions}
              priceBounds={priceBounds}
              sort={sort}
            />
          </div>

          <div className="mt-6">
            <div className="min-w-0 flex-1">
              <CatalogGrid products={products} variant="editorial" />
            </div>
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
              keepQuery={keepQuery}
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
