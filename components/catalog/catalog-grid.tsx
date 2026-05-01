import { ProductCard } from "@/components/cart/product-card";
import type { Product } from "@/types/product";

interface CatalogGridProps {
  products: Product[];
  variant?: "default" | "editorial";
}

export function CatalogGrid({ products, variant = "default" }: CatalogGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border bg-white px-5 py-12 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Nenhum produto encontrado
        </p>
        <p className="mt-2 text-sm font-medium text-melier-ink">
          Ajuste a categoria escolhida ou volte para ver todas as peças.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "editorial"
          ? "grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 xl:grid-cols-4"
          : "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
      }
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
