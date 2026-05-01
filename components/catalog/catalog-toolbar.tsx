import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ProductSort } from "@/lib/catalog/get-products";

const sortOptions: Array<{ label: string; value: ProductSort }> = [
  { label: "Destaque", value: "featured" },
  { label: "Preço: menor ao maior", value: "price-asc" },
  { label: "Preço: maior ao menor", value: "price-desc" },
  { label: "A - Z", value: "name-asc" },
  { label: "Z - A", value: "name-desc" },
];

interface CatalogToolbarProps {
  title: string;
  description?: string;
  count: number;
  sort: ProductSort;
  basePath: string;
  variant?: "default" | "editorial";
}

export function CatalogToolbar({
  title,
  description,
  count,
  sort,
  basePath,
  variant = "default",
}: CatalogToolbarProps) {
  if (variant === "editorial") {
    return (
      <div className="border-b border-black/10 pb-5">
        <div className="flex flex-wrap items-center gap-4 text-sm text-melier-ink">
          <div className="relative group">
            <button
              className="flex items-center gap-2 text-sm font-medium text-melier-ink"
              type="button"
            >
              <span>Ordenar por</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <div className="absolute left-0 top-full z-20 hidden min-w-56 bg-white pt-3 group-hover:block">
              <div className="border border-black/10 bg-white p-3 shadow-soft">
                <div className="grid gap-2">
                  {sortOptions.map((option) => (
                    <Link
                      className={`text-sm transition ${
                        sort === option.value
                          ? "font-semibold text-melier-ink"
                          : "text-muted-foreground hover:text-melier-rose"
                      }`}
                      href={
                        option.value === "featured" ? basePath : `${basePath}?sort=${option.value}`
                      }
                      key={option.value}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            className="flex items-center gap-2 text-sm font-medium text-melier-ink"
            type="button"
          >
            <span>Filtrar</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <p className="text-sm">
              <span>[{count}] produtos</span>
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h1 className="text-2xl font-semibold text-melier-ink sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase leading-none text-melier-ink sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-full border bg-muted/40 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-melier-ink">
            {count} peças
          </div>

          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <Link
                className={`rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] transition ${
                  sort === option.value
                    ? "border-melier-ink bg-melier-ink text-white"
                    : "border-black/10 bg-white text-melier-ink hover:border-melier-rose hover:text-melier-rose"
                }`}
                href={option.value === "featured" ? basePath : `${basePath}?sort=${option.value}`}
                key={option.value}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
