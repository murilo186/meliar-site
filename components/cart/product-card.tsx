"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart/use-cart";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "editorial";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addItem } = useCart();
  const productHref = product.subcategorySlug
    ? `/${product.categorySlug}/${product.subcategorySlug}`
    : `/${product.categorySlug}`;
  const isEditorial = variant === "editorial";

  return (
    <article
      className={
        isEditorial
          ? "group overflow-hidden bg-white"
          : "group overflow-hidden rounded-2xl border bg-card"
      }
    >
      <Link className="block" href={productHref}>
        <div
          className={`relative overflow-hidden ${
            isEditorial ? "aspect-[0.73] bg-[#f6f1ea]" : "aspect-[4/5] bg-muted"
          }`}
        >
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
      </Link>
      <div className={isEditorial ? "grid gap-2 px-0 py-3" : "grid gap-2 p-3"}>
        <div className={isEditorial ? "grid gap-1" : "flex items-start justify-between gap-3"}>
          <div>
            <h3
              className={`leading-tight text-melier-ink ${
                isEditorial ? "text-sm font-semibold uppercase" : "text-sm font-extrabold"
              }`}
            >
              {product.name}
            </h3>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {product.color}
            </p>
          </div>
          {!isEditorial ? (
            <p className="shrink-0 text-right text-sm font-extrabold text-melier-ink">
              {formatCurrency(product.price)}
            </p>
          ) : null}
        </div>
        <div
          className={
            isEditorial ? "grid gap-2" : "flex items-center justify-between gap-2"
          }
        >
          <p className={`text-xs ${isEditorial ? "font-semibold text-melier-ink" : "font-bold text-muted-foreground"}`}>
            {product.oldPrice ? (
              <>
                <span className="mr-2 line-through text-muted-foreground">
                  {formatCurrency(product.oldPrice)}
                </span>
                <span>{formatCurrency(product.price)}</span>
              </>
            ) : (
              isEditorial ? formatCurrency(product.price) : "Até 3x sem juros"
            )}
          </p>
          <Button
            className={isEditorial ? "w-full rounded-none" : undefined}
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
