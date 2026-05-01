import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/format";
import { useCart } from "./use-cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card">
      <a className="block" href="#">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            src={product.image}
          />
          {product.label ? (
            <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-melier-rose shadow-sm">
              {product.label}
            </span>
          ) : null}
          <Button
            aria-label="Favoritar"
            className="absolute right-2 top-2 bg-white/90 text-melier-ink hover:bg-white hover:text-melier-rose"
            size="icon"
            variant="ghost"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </a>
      <div className="grid gap-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold leading-tight text-melier-ink">
              {product.name}
            </h3>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {product.color}
            </p>
          </div>
          <p className="shrink-0 text-right text-sm font-extrabold text-melier-ink">
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-muted-foreground">
            {product.oldPrice ? (
              <span className="line-through">{formatCurrency(product.oldPrice)}</span>
            ) : (
              "Até 3x sem juros"
            )}
          </p>
          <Button
            onClick={() => addItem(product)}
            size="sm"
            type="button"
            variant="outline"
          >
            Comprar
          </Button>
        </div>
      </div>
    </article>
  );
}
