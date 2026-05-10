"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  buildCatalogHref,
  type CatalogFilterOption,
  type CatalogPriceBounds,
} from "@/lib/catalog/catalog-filters";
import { getCategories } from "@/lib/catalog/get-categories";
import type { ProductSort } from "@/lib/catalog/get-products";

const sortOptions: Array<{ label: string; value: ProductSort }> = [
  { label: "Destaque", value: "featured" },
  { label: "Preço: menor ao maior", value: "price-asc" },
  { label: "Preço: maior ao menor", value: "price-desc" },
  { label: "A - Z", value: "name-asc" },
  { label: "Z - A", value: "name-desc" },
];

interface CatalogMobileFiltersProps {
  basePath: string;
  keepQuery?: Record<string, string | undefined>;
  sort: ProductSort;
  selectedColors: string[];
  selectedSizes: string[];
  selectedPriceMin?: number;
  selectedPriceMax?: number;
  colorOptions: CatalogFilterOption[];
  sizeOptions: CatalogFilterOption[];
  priceBounds: CatalogPriceBounds;
  count: number;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPriceLabel(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeRangeForQuery(
  min: number,
  max: number,
  bounds: CatalogPriceBounds,
) {
  return {
    min: min <= bounds.min ? undefined : min,
    max: max >= bounds.max ? undefined : max,
  };
}

export function CatalogMobileFilters({
  basePath,
  keepQuery,
  sort,
  selectedColors,
  selectedSizes,
  selectedPriceMin,
  selectedPriceMax,
  colorOptions,
  sizeOptions,
  priceBounds,
  count,
}: CatalogMobileFiltersProps) {
  const categories = getCategories();
  const rangeMin = priceBounds.min;
  const rangeMax = priceBounds.max;
  const initialMin = clamp(selectedPriceMin ?? rangeMin, rangeMin, rangeMax);
  const initialMax = clamp(selectedPriceMax ?? rangeMax, rangeMin, rangeMax);
  const [draftColors, setDraftColors] = useState<string[]>(selectedColors);
  const [draftSizes, setDraftSizes] = useState<string[]>(selectedSizes);
  const [draftMin, setDraftMin] = useState<number>(Math.min(initialMin, initialMax));
  const [draftMax, setDraftMax] = useState<number>(Math.max(initialMin, initialMax));

  useEffect(() => {
    setDraftColors(selectedColors);
  }, [selectedColors]);

  useEffect(() => {
    setDraftSizes(selectedSizes);
  }, [selectedSizes]);

  useEffect(() => {
    const nextMin = clamp(selectedPriceMin ?? rangeMin, rangeMin, rangeMax);
    const nextMax = clamp(selectedPriceMax ?? rangeMax, rangeMin, rangeMax);
    setDraftMin(Math.min(nextMin, nextMax));
    setDraftMax(Math.max(nextMin, nextMax));
  }, [rangeMax, rangeMin, selectedPriceMax, selectedPriceMin]);

  const clearFiltersHref = useMemo(
    () =>
      buildCatalogHref({
        basePath,
        keepQuery,
        sort,
        filters: {
          colors: [],
          sizes: [],
          priceMin: undefined,
          priceMax: undefined,
        },
      }),
    [basePath, keepQuery, sort],
  );

  const applyFiltersHref = useMemo(() => {
    const normalized = normalizeRangeForQuery(draftMin, draftMax, priceBounds);
    return buildCatalogHref({
      basePath,
      keepQuery,
      sort,
      filters: {
        colors: draftColors,
        sizes: draftSizes,
        priceMin: normalized.min,
        priceMax: normalized.max,
      },
    });
  }, [
    basePath,
    draftColors,
    draftMax,
    draftMin,
    draftSizes,
    keepQuery,
    priceBounds,
    sort,
  ]);

  const canSlide = rangeMax > rangeMin;
  const leftPercent = canSlide
    ? ((draftMin - rangeMin) / (rangeMax - rangeMin)) * 100
    : 0;
  const rightPercent = canSlide
    ? ((draftMax - rangeMin) / (rangeMax - rangeMin)) * 100
    : 100;

  return (
    <div className="border-y border-black/10 py-2 lg:hidden">
      <div className="grid grid-cols-2 gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-10 rounded-none" type="button" variant="outline">
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </SheetTrigger>
          <SheetContent className="px-4 pb-6 pt-4" side="bottom">
            <SheetHeader className="mb-3 border-b border-black/10 pb-3">
              <SheetTitle className="text-base font-black uppercase tracking-[0.08em]">
                Ordenar por
              </SheetTitle>
            </SheetHeader>
            <div className="grid gap-2">
              {sortOptions.map((option) => {
                const href = buildCatalogHref({
                  basePath,
                  keepQuery,
                  sort: option.value,
                  filters: {
                    colors: selectedColors,
                    sizes: selectedSizes,
                    priceMin: selectedPriceMin,
                    priceMax: selectedPriceMax,
                  },
                });

                return (
                  <SheetClose asChild key={option.value}>
                    <Link
                      className={`border px-3 py-3 text-sm font-semibold ${
                        sort === option.value
                          ? "border-melier-rose bg-melier-rose text-white"
                          : "border-black/15 text-melier-ink"
                      }`}
                      href={href}
                    >
                      {option.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-10 rounded-none" type="button" variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Filtrar
            </Button>
          </SheetTrigger>
          <SheetContent className="px-4 pb-6 pt-4" side="bottom">
            <SheetHeader className="mb-3 border-b border-black/10 pb-3">
              <SheetTitle className="text-base font-black uppercase tracking-[0.08em]">
                Filtros
              </SheetTitle>
            </SheetHeader>

            <div className="grid max-h-[62vh] gap-5 overflow-y-auto pb-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-melier-ink">
                  Categorias
                </p>
                <div className="mt-2 grid gap-1.5">
                  <SheetClose asChild>
                    <Link className="text-sm font-semibold text-melier-ink" href="/produtos">
                      Ver todos
                    </Link>
                  </SheetClose>
                  {categories.map((category) => (
                    <div className="grid gap-1" key={category.slug}>
                      <SheetClose asChild>
                        <Link className="text-sm font-semibold text-melier-ink" href={category.href}>
                          {category.name}
                        </Link>
                      </SheetClose>
                      {category.children?.length ? (
                        <div className="grid gap-1 pl-3">
                          {category.children.map((subcategory) => (
                            <SheetClose asChild key={subcategory.slug}>
                              <Link className="text-xs text-muted-foreground" href={subcategory.href}>
                                {subcategory.name}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-melier-ink">
                  Cores
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {colorOptions.map((option) => {
                    const active = draftColors.includes(option.value);
                    return (
                      <button
                        className={`border px-2.5 py-2 text-left text-xs font-bold ${
                          active
                            ? "border-melier-rose bg-melier-rose text-white"
                            : "border-black/15 text-melier-ink"
                        }`}
                        key={option.value}
                        onClick={() =>
                          setDraftColors((current) => toggleValue(current, option.value))
                        }
                        type="button"
                      >
                        {option.label} ({option.count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-melier-ink">
                  Tamanhos
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizeOptions.map((option) => {
                    const active = draftSizes.includes(option.value);
                    return (
                      <button
                        className={`min-w-10 border px-2.5 py-2 text-xs font-extrabold uppercase ${
                          active
                            ? "border-melier-rose bg-melier-rose text-white"
                            : "border-black/15 text-melier-ink"
                        }`}
                        key={option.value}
                        onClick={() =>
                          setDraftSizes((current) => toggleValue(current, option.value))
                        }
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-melier-ink">
                  Faixa de preço
                </p>
                <div className="mt-3 rounded-md border border-black/10 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-melier-ink">
                    <span>{formatPriceLabel(draftMin)}</span>
                    <span>{formatPriceLabel(draftMax)}</span>
                  </div>
                  <div className="relative h-7">
                    <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-black/10" />
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-melier-rose"
                      style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
                    />
                    <input
                      className="pointer-events-none absolute h-7 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-melier-rose [&::-webkit-slider-thumb]:bg-white"
                      max={rangeMax}
                      min={rangeMin}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setDraftMin(Math.min(value, draftMax));
                      }}
                      step={1}
                      type="range"
                      value={draftMin}
                    />
                    <input
                      className="pointer-events-none absolute h-7 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-melier-rose [&::-webkit-slider-thumb]:bg-white"
                      max={rangeMax}
                      min={rangeMin}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setDraftMax(Math.max(value, draftMin));
                      }}
                      step={1}
                      type="range"
                      value={draftMax}
                    />
                  </div>
                  {!canSlide ? (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      Não há variação de preço nesta seleção.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-black/10 pt-4">
              <SheetClose asChild>
                <Button asChild className="h-11 rounded-none" type="button" variant="outline">
                  <Link href={clearFiltersHref}>Limpar</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="h-11 rounded-none" type="button">
                  <Link href={applyFiltersHref}>Ver {count} peças</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

