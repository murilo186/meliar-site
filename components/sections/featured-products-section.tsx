"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProductImagePlaceholder } from "@/components/product/product-image-placeholder";
import { getProductPrimaryImage, getVariantBySlug } from "@/lib/catalog/product-ui-helpers";
import { formatCurrency, getDiscountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface FeaturedProductsSectionProps {
  products: Product[];
}

const IMAGE_ROTATION_MS = 2200;
const AUTOPLAY_PAUSE_MS = 8000;
const BROOKS_CARD_ASPECT_CLASS = "aspect-[69/103]";

function getSlideImages(product: Product) {
  const variant = getVariantBySlug(product, product.defaultVariantSlug);
  return variant.images.length > 0
    ? variant.images
    : [getProductPrimaryImage(product)].filter((image): image is string => Boolean(image));
}

function wrapIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pausedUntil, setPausedUntil] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;
    if (activeSlide > products.length - 1) {
      setActiveSlide(0);
    }
  }, [activeSlide, products.length]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [activeSlide]);

  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    const now = Date.now();
    const waitTime = pausedUntil > now ? pausedUntil - now : IMAGE_ROTATION_MS;

    const timer = window.setTimeout(() => {
      if (Date.now() < pausedUntil) {
        return;
      }

      const centerProduct = products[activeSlide];
      if (!centerProduct) {
        return;
      }

      const centerImages = getSlideImages(centerProduct);
      if (activeImageIndex < centerImages.length - 1) {
        setActiveImageIndex((current) => current + 1);
        return;
      }

      setActiveImageIndex(0);
      setActiveSlide((current) => wrapIndex(current + 1, products.length));
    }, waitTime);

    return () => window.clearTimeout(timer);
  }, [activeImageIndex, activeSlide, pausedUntil, products]);

  const markInteraction = () => {
    setPausedUntil(Date.now() + AUTOPLAY_PAUSE_MS);
  };

  const goToPrevious = () => {
    markInteraction();
    setActiveSlide((current) => wrapIndex(current - 1, products.length));
  };

  const goToNext = () => {
    markInteraction();
    setActiveSlide((current) => wrapIndex(current + 1, products.length));
  };

  const visibleCards = (() => {
    const offsets = [-2, -1, 0, 1, 2];
    return offsets.map((offset) => {
      const productIndex = wrapIndex(activeSlide + offset, products.length);
      return {
        offset,
        product: products[productIndex],
        productIndex,
      };
    });
  })();

  if (products.length === 0) {
    return null;
  }

  const mobileCards = visibleCards.filter((card) => Math.abs(card.offset) <= 1);

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-melier-rose">
              Destaques da semana
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase leading-none text-melier-ink sm:text-4xl">
              Elas estão usando
            </h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              aria-label="Slide anterior"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-sm font-bold text-melier-ink transition hover:border-melier-rose hover:text-melier-rose"
              onClick={goToPrevious}
              type="button"
            >
              {"<"}
            </button>
            <button
              aria-label="Próximo slide"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-sm font-bold text-melier-ink transition hover:border-melier-rose hover:text-melier-rose"
              onClick={goToNext}
              type="button"
            >
              {">"}
            </button>
          </div>
        </div>

        <div className="sm:hidden" onPointerDown={markInteraction}>
          <div className="overflow-hidden">
            <div className="flex items-end justify-center gap-1">
              {mobileCards.map(({ offset, product, productIndex }) => {
                const images = getSlideImages(product);
                const isCenter = offset === 0;
                const isAdjacent = Math.abs(offset) === 1;
                const discountPercent = getDiscountPercent(product.price, product.oldPrice);
                const imageSrc = isCenter
                  ? (images[activeImageIndex] ?? images[0])
                  : images[0];

                const cardClasses = cn(
                  "overflow-hidden rounded-[1.4rem] bg-[#f6eee5] transition-all duration-500",
                  isCenter ? "translate-y-0" : "translate-y-2",
                );

                const imageClasses = cn(
                  "h-full w-full object-cover transition-transform duration-500",
                  isCenter ? "group-hover:scale-[1.03]" : "",
                );

                const content = (
                  <article className={cardClasses}>
                    <div className={cn("relative overflow-hidden", BROOKS_CARD_ASPECT_CLASS)}>
                      {imageSrc ? (
                        <Image
                          alt={product.name}
                          className={imageClasses}
                          fill
                          sizes="74vw"
                          src={imageSrc}
                        />
                      ) : (
                        <ProductImagePlaceholder />
                      )}
                      {!isCenter ? (
                        <div
                          className={cn(
                            "pointer-events-none absolute inset-0 z-10",
                            isAdjacent ? "bg-black/64" : "bg-black/76",
                          )}
                        />
                      ) : null}
                      <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/25 bg-[#8f8f8f]/68 px-2.5 py-2 backdrop-blur-sm shadow-[0_6px_18px_rgba(17,17,17,0.25)]">
                        <div className="flex items-center gap-2">
                          {images[0] ? (
                            <Image
                              alt={`Miniatura ${product.name}`}
                              className="h-12 w-10 shrink-0 rounded-lg border border-white/40 bg-white/20 object-cover"
                              height={48}
                              src={images[0]}
                              width={40}
                            />
                          ) : (
                            <ProductImagePlaceholder className="h-12 w-10 shrink-0 rounded-lg border border-white/40 bg-white/20 px-1 text-[8px]" />
                          )}
                          <div className="min-w-0 flex-1 text-left">
                            <p
                              className="line-clamp-2 text-left text-[0.92rem] font-semibold leading-tight text-white"
                              style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.75)" }}
                            >
                              {product.name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <p
                                className="text-left text-[0.95rem] font-bold leading-none text-white"
                                style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.85)" }}
                              >
                                {formatCurrency(product.price)}
                              </p>
                              {discountPercent ? (
                                <p
                                  className="text-left text-[11px] font-semibold leading-none text-white/85 line-through"
                                  style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.85)" }}
                                >
                                  {formatCurrency(product.oldPrice!)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );

                if (isCenter) {
                  return (
                    <Link
                      className="group block w-[74%] max-w-[276px] shrink-0 scale-[1.02] opacity-100 transition-all duration-500"
                      href={`/produto/${product.slug}`}
                      key={`${product.id}-${offset}`}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    className="group block w-[64%] max-w-[248px] shrink-0 scale-[0.88] opacity-[0.58] transition-all duration-500"
                    key={`${product.id}-${offset}`}
                    onClick={() => {
                      markInteraction();
                      setActiveSlide(productIndex);
                    }}
                    type="button"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="hidden grid-cols-5 items-end gap-4 sm:grid"
          onPointerDown={markInteraction}
        >
          {visibleCards.map(({ offset, product, productIndex }) => {
            const images = getSlideImages(product);
            const isCenter = offset === 0;
            const isAdjacent = Math.abs(offset) === 1;
            const discountPercent = getDiscountPercent(product.price, product.oldPrice);
            const imageSrc = isCenter
              ? (images[activeImageIndex] ?? images[0])
              : images[0];

            const cardClasses = cn(
              "overflow-hidden rounded-[1.4rem] bg-[#f6eee5] transition-all duration-500",
              isCenter ? "-translate-y-1" : "translate-y-3",
            );

            const imageClasses = cn(
              "h-full w-full object-cover transition-transform duration-500",
              isCenter ? "group-hover:scale-[1.03]" : "",
            );

            const content = (
              <article className={cardClasses}>
                <div className={cn("relative overflow-hidden", BROOKS_CARD_ASPECT_CLASS)}>
                  {imageSrc ? (
                    <Image
                      alt={product.name}
                      className={imageClasses}
                      fill
                      sizes="(min-width: 1024px) 20vw, 33vw"
                      src={imageSrc}
                    />
                  ) : (
                    <ProductImagePlaceholder />
                  )}
                  {!isCenter ? (
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-0 z-10",
                        isAdjacent ? "bg-black/64" : "bg-black/76",
                      )}
                    />
                  ) : null}
                  <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/25 bg-[#8f8f8f]/68 px-2.5 py-2 backdrop-blur-sm shadow-[0_6px_18px_rgba(17,17,17,0.25)]">
                    <div className="flex items-center gap-2">
                      {images[0] ? (
                        <Image
                          alt={`Miniatura ${product.name}`}
                          className="h-12 w-10 shrink-0 rounded-lg border border-white/40 bg-white/20 object-cover"
                          height={48}
                          src={images[0]}
                          width={40}
                        />
                      ) : (
                        <ProductImagePlaceholder className="h-12 w-10 shrink-0 rounded-lg border border-white/40 bg-white/20 px-1 text-[8px]" />
                      )}
                      <div className="min-w-0 flex-1 text-left">
                        <p
                          className="line-clamp-2 text-left text-[0.92rem] font-semibold leading-tight text-white"
                          style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.75)" }}
                        >
                          {product.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <p
                            className="text-left text-[0.95rem] font-bold leading-none text-white"
                            style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.85)" }}
                          >
                            {formatCurrency(product.price)}
                          </p>
                          {discountPercent ? (
                            <p
                              className="text-left text-[11px] font-semibold leading-none text-white/85 line-through"
                              style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.85)" }}
                            >
                              {formatCurrency(product.oldPrice!)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );

            if (isCenter) {
              return (
                <Link
                  className="group col-span-1 block w-full max-w-[276px] justify-self-center scale-100 opacity-100 transition-all duration-500"
                  href={`/produto/${product.slug}`}
                  key={`${product.id}-${offset}`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                className={cn(
                  "group col-span-1 block w-full justify-self-center transition-all duration-500",
                  isAdjacent
                    ? "max-w-[258px] scale-[0.94] opacity-[0.55]"
                    : "max-w-[244px] scale-[0.86] opacity-[0.42]",
                )}
                key={`${product.id}-${offset}`}
                onClick={() => {
                  markInteraction();
                  setActiveSlide(productIndex);
                }}
                type="button"
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
