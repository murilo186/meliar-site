import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { ProductCard } from "./product-card";

export function FeaturedProducts() {
  return (
    <section className="bg-white pb-4 pt-0 sm:pb-5 sm:pt-0" id="produtos">
      <div className="container">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
              Compra rápida
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-none text-melier-ink">
              Produtos em destaque
            </h2>
          </div>
          <Button className="shrink-0" size="sm" variant="outline">
            <SlidersHorizontal className="h-4 w-4" />
            Filtrar
          </Button>
        </div>
        <div className="mb-3 flex items-center justify-between rounded-xl border bg-muted/50 px-3 py-2">
          <span className="text-xs font-bold text-muted-foreground">
            {products.length} peças
          </span>
          <button className="text-xs font-extrabold uppercase tracking-[0.1em] text-melier-ink hover:text-melier-rose">
            Ordenar
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
