"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductImagePlaceholder } from "@/components/product/product-image-placeholder";
import { getProductPrimaryImage } from "@/lib/catalog/product-ui-helpers";
import { formatCurrency, getDiscountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface NewArrivalsSectionProps {
  products: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const root = mobileCarouselRef.current;

    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          )[0];

        if (!visibleEntry) {
          return;
        }

        const nextIndex = slideRefs.current.findIndex(
          (slide) => slide === visibleEntry.target,
        );

        if (nextIndex >= 0) {
          setActiveSlide(nextIndex);
        }
      },
      {
        root,
        threshold: [0.55, 0.7],
      },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) {
        observer.observe(slide);
      }
    });

    return () => observer.disconnect();
  }, [products.length]);

  useEffect(() => {
    setActiveSlide(0);
  }, [products.length]);

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
            href="/produtos?novos=1"
          >
            Ver vitrine
          </Link>
        </div>

        <div className="md:hidden">
          <div
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none"
            ref={mobileCarouselRef}
          >
            {products.map((product, index) => (
              // Keep products visible even when DB images are still being uploaded.
              <Link
                className="group block basis-[84%] shrink-0 snap-start"
                href={`/produto/${product.slug}`}
                key={product.id}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
              >
                <article className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-soft">
                  <div className="relative aspect-[0.92] overflow-hidden bg-[#f7efe8]">
                    {getProductPrimaryImage(product) ? (
                      <img
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        src={getProductPrimaryImage(product)}
                      />
                    ) : (
                      <ProductImagePlaceholder />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-3">
                    <h3 className="line-clamp-1 text-sm font-extrabold leading-tight text-melier-ink">
                      {product.name}
                    </h3>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold text-melier-ink">
                        {formatCurrency(product.price)}
                      </p>
                      {getDiscountPercent(product.price, product.oldPrice) ? (
                        <p className="text-[11px] font-semibold text-muted-foreground line-through">
                          {formatCurrency(product.oldPrice!)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {products.length > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {products.map((product, index) => (
                <button
                  aria-label={`Ir para ${product.name}`}
                  aria-current={activeSlide === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    activeSlide === index
                      ? "w-4 bg-melier-rose"
                      : "w-1.5 bg-black/20",
                  )}
                  key={product.id}
                  onClick={() => {
                    slideRefs.current[index]?.scrollIntoView({
                      behavior: "smooth",
                      inline: "start",
                      block: "nearest",
                    });
                  }}
                  type="button"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {products.map((product) => (
            <Link
              className="group overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-soft"
              href={`/produto/${product.slug}`}
              key={product.id}
            >
              <div className="relative aspect-[0.78] overflow-hidden bg-[#f7efe8]">
                {getProductPrimaryImage(product) ? (
                  <img
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    src={getProductPrimaryImage(product)}
                  />
                ) : (
                  <ProductImagePlaceholder />
                )}
              </div>
              <div className="grid gap-1 px-3 py-3">
                <h3 className="text-sm font-extrabold leading-tight text-melier-ink">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-melier-ink">
                    {formatCurrency(product.price)}
                  </p>
                  {getDiscountPercent(product.price, product.oldPrice) ? (
                    <p className="text-[11px] font-semibold text-muted-foreground line-through">
                      {formatCurrency(product.oldPrice!)}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
