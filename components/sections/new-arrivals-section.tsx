"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useCart } from "@/components/cart/use-cart";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { formatCurrency } from "@/lib/format";

const arrivals = products.slice(0, 6);

export function NewArrivalsSection() {
  const { addItem } = useCart();

  return (
    <section className="bg-melier-shell py-8 sm:py-10" id="produtos">
      <div className="container">
        <div className="mb-5 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-melier-rose">
              Novidades da semana
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase leading-none text-melier-ink sm:text-4xl">
              Acabaram de chegar
            </h2>
          </div>
          <Link
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-melier-ink transition hover:border-melier-rose hover:text-melier-rose"
            href="/produtos"
          >
            Ver vitrine
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {arrivals.map((product) => (
            <article
              className="group overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-soft"
              key={product.id}
            >
              <Link
                className="block"
                href={
                  product.subcategorySlug
                    ? `/${product.categorySlug}/${product.subcategorySlug}`
                    : `/${product.categorySlug}`
                }
              >
                <div className="relative aspect-[0.78] overflow-hidden bg-[#f7efe8]">
                  <img
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    src={product.image}
                  />
                  {product.label ? (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-melier-rose">
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

              <div className="grid gap-3 p-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    {product.category}
                  </p>
                  <h3 className="mt-1 text-sm font-extrabold leading-tight text-melier-ink">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {product.color}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold text-melier-ink">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      {product.oldPrice ? (
                        <span className="line-through">
                          {formatCurrency(product.oldPrice)}
                        </span>
                      ) : (
                        "Em ate 3x sem juros"
                      )}
                    </p>
                  </div>

                  <Button
                    className="h-8 px-3 text-[11px] uppercase tracking-[0.08em]"
                    onClick={() => addItem(product)}
                    size="sm"
                    type="button"
                  >
                    Comprar
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
