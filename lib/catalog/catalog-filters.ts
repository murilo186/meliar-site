import type { Product } from "@/types/product";
import type { ProductSort } from "@/lib/catalog/get-products";

export interface CatalogFilterOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogPriceBounds {
  min: number;
  max: number;
}

export interface CatalogFilterState {
  colors: string[];
  sizes: string[];
  priceMin?: number;
  priceMax?: number;
}

interface BuildCatalogHrefInput {
  basePath: string;
  keepQuery?: Record<string, string | undefined>;
  sort: ProductSort;
  filters: CatalogFilterState;
}

const sizeOrder = ["PP", "P", "M", "G", "GG", "XG", "XGG", "U"];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeColor(value: string) {
  return value.trim().toLowerCase();
}

function normalizeSize(value: string) {
  return value.trim().toUpperCase();
}

export function parseFilterParam(value?: string) {
  if (!value) {
    return [];
  }

  return unique(
    value
      .split(",")
      .map((item) => decodeURIComponent(item).trim())
      .filter(Boolean),
  );
}

export function parsePriceParam(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return Number(parsed.toFixed(2));
}

export function serializeFilterParam(values: string[]) {
  const normalized = unique(values.map((value) => value.trim()).filter(Boolean));
  return normalized.length > 0 ? normalized.join(",") : undefined;
}

export function serializePriceParam(value?: number) {
  if (value == null || !Number.isFinite(value)) {
    return undefined;
  }

  return String(Math.round(value));
}

export function buildCatalogHref({
  basePath,
  keepQuery,
  sort,
  filters,
}: BuildCatalogHrefInput) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(keepQuery ?? {})) {
    if (!value) {
      continue;
    }

    if (
      key === "sort" ||
      key === "cores" ||
      key === "tamanhos" ||
      key === "precos" ||
      key === "precoMin" ||
      key === "precoMax"
    ) {
      continue;
    }

    query.set(key, value);
  }

  if (sort !== "featured") {
    query.set("sort", sort);
  }

  const colorsParam = serializeFilterParam(filters.colors);
  const sizesParam = serializeFilterParam(filters.sizes);
  const minPriceParam = serializePriceParam(filters.priceMin);
  const maxPriceParam = serializePriceParam(filters.priceMax);

  if (colorsParam) {
    query.set("cores", colorsParam);
  }
  if (sizesParam) {
    query.set("tamanhos", sizesParam);
  }
  if (minPriceParam) {
    query.set("precoMin", minPriceParam);
  }
  if (maxPriceParam) {
    query.set("precoMax", maxPriceParam);
  }

  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function getCatalogFilterOptions(products: Product[]) {
  const colorLabels = new Map<string, string>();
  const colorCounts = new Map<string, number>();
  const sizeCounts = new Map<string, number>();
  const allPrices = products.map((product) => product.price);

  for (const product of products) {
    const productColors = new Set<string>();
    const productSizes = new Set<string>();

    for (const variant of product.variants) {
      const colorValue = normalizeColor(variant.slug);
      if (!colorLabels.has(colorValue)) {
        colorLabels.set(colorValue, variant.color);
      }
      productColors.add(colorValue);
    }

    for (const size of product.sizes) {
      productSizes.add(normalizeSize(size));
    }

    for (const colorValue of productColors) {
      colorCounts.set(colorValue, (colorCounts.get(colorValue) ?? 0) + 1);
    }

    for (const sizeValue of productSizes) {
      sizeCounts.set(sizeValue, (sizeCounts.get(sizeValue) ?? 0) + 1);
    }
  }

  const colors: CatalogFilterOption[] = Array.from(colorLabels.entries())
    .map(([value, label]) => ({
      value,
      label,
      count: colorCounts.get(value) ?? 0,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));

  const sizes: CatalogFilterOption[] = Array.from(sizeCounts.entries())
    .map(([value, count]) => ({
      value,
      label: value,
      count,
    }))
    .sort((left, right) => {
      const leftOrder = sizeOrder.indexOf(left.value);
      const rightOrder = sizeOrder.indexOf(right.value);

      if (leftOrder >= 0 && rightOrder >= 0) {
        return leftOrder - rightOrder;
      }
      if (leftOrder >= 0) {
        return -1;
      }
      if (rightOrder >= 0) {
        return 1;
      }

      return left.label.localeCompare(right.label, "pt-BR");
    });

  const minPrice = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0;
  const maxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 0;

  return {
    colors,
    sizes,
    priceBounds: {
      min: minPrice,
      max: maxPrice,
    } satisfies CatalogPriceBounds,
  };
}

export function filterProductsByCatalogFilters(
  products: Product[],
  filters: CatalogFilterState,
) {
  const selectedColors = new Set(filters.colors.map(normalizeColor));
  const selectedSizes = new Set(filters.sizes.map(normalizeSize));

  return products.filter((product) => {
    const matchesColor =
      selectedColors.size === 0 ||
      product.variants.some((variant) =>
        selectedColors.has(normalizeColor(variant.slug)),
      );

    if (!matchesColor) {
      return false;
    }

    const matchesSize =
      selectedSizes.size === 0 ||
      product.sizes.some((size) => selectedSizes.has(normalizeSize(size)));

    if (!matchesSize) {
      return false;
    }

    const matchesMinPrice =
      filters.priceMin == null || product.price >= filters.priceMin;
    const matchesMaxPrice =
      filters.priceMax == null || product.price <= filters.priceMax;

    return matchesMinPrice && matchesMaxPrice;
  });
}

