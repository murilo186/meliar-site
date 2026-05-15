"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/use-cart";
import { ProductImagePlaceholder } from "@/components/product/product-image-placeholder";
import { useFavorites } from "@/components/providers/favorites-provider";
import { Button } from "@/components/ui/button";
import { getDefaultVariant } from "@/lib/catalog/product-ui-helpers";
import { formatCurrency, getDiscountPercent } from "@/lib/format";
import { useAuthState } from "@/lib/hooks/use-auth-state";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const defaultVariant = getDefaultVariant(product);
  const [selectedVariantSlug, setSelectedVariantSlug] = useState(defaultVariant.slug);
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(defaultVariant.images[0]);
  const [showSizeError, setShowSizeError] = useState(false);
  const [didAddRecently, setDidAddRecently] = useState(false);
  const mobileGalleryRef = useRef<HTMLDivElement | null>(null);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAdmin } = useAuthState();
  const isFavorited = isFavorite(product.slug);
  const discountPercent = getDiscountPercent(product.price, product.oldPrice);
  const hasDiscount = Boolean(discountPercent && product.oldPrice);

  const selectedVariant = useMemo(
    () =>
      product.variants.find((variant) => variant.slug === selectedVariantSlug) ??
      defaultVariant,
    [defaultVariant, product.variants, selectedVariantSlug],
  );

  const stockByVariantSlug = product.stockByVariantSlug;
  const hasStockSync = Boolean(
    stockByVariantSlug && Object.keys(stockByVariantSlug).length > 0,
  );

  const isVariantOutOfStock = (variantSlug: string) => {
    if (!hasStockSync) return false;
    const stockBySize = stockByVariantSlug?.[variantSlug];
    if (!stockBySize) return true;
    return Object.values(stockBySize).every((quantity) => quantity <= 0);
  };

  const isSizeOutOfStock = (variantSlug: string, size: string) => {
    if (!hasStockSync) return false;
    const stockBySize = stockByVariantSlug?.[variantSlug];
    if (!stockBySize) return true;
    return (stockBySize[size] ?? 0) <= 0;
  };

  const selectedVariantOutOfStock = isVariantOutOfStock(selectedVariant.slug);

  const handleVariantChange = (variantSlug: string) => {
    const variant =
      product.variants.find((item) => item.slug === variantSlug) ?? defaultVariant;

    setSelectedVariantSlug(variant.slug);
    setActiveImage(variant.images[0]);
    if (selectedSize && isSizeOutOfStock(variant.slug, selectedSize)) {
      setSelectedSize("");
    }

    requestAnimationFrame(() => {
      mobileGalleryRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    });
  };

  const handleMobileGalleryScroll = () => {
    const element = mobileGalleryRef.current;

    if (!element) {
      return;
    }

    const nextIndex = Math.round(element.scrollLeft / element.clientWidth);
    const nextImage = selectedVariant.images[nextIndex];

    if (nextImage && nextImage !== activeImage) {
      setActiveImage(nextImage);
    }
  };

  const scrollToImage = (image: string) => {
    const element = mobileGalleryRef.current;
    const imageIndex = selectedVariant.images.indexOf(image);

    setActiveImage(image);

    if (!element || imageIndex < 0) {
      return;
    }

    element.scrollTo({
      left: imageIndex * element.clientWidth,
      behavior: "smooth",
    });
  };

  const handleAdvanceImage = () => {
    if (selectedVariant.images.length === 0) {
      return;
    }

    const currentIndex = activeImage
      ? selectedVariant.images.indexOf(activeImage)
      : -1;
    const nextIndex =
      currentIndex >= 0
        ? (currentIndex + 1) % selectedVariant.images.length
        : 0;

    setActiveImage(selectedVariant.images[nextIndex]);
  };

  const handleAddToCart = () => {
    if (selectedVariantOutOfStock) {
      return;
    }

    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    if (isSizeOutOfStock(selectedVariant.slug, selectedSize)) {
      return;
    }

    addItem({
      id: `${product.slug}:${selectedVariant.slug}:${selectedSize}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price,
      image: activeImage ?? "",
      color: selectedVariant.color,
      size: selectedSize,
    });

    setShowSizeError(false);
    setDidAddRecently(true);
    window.setTimeout(() => setDidAddRecently(false), 700);
  };

  return (
    <section className="bg-white py-4 sm:py-6">
      <div className="container">
        <nav className="mb-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <Link className="whitespace-nowrap" href="/produtos">
            Loja
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link className="whitespace-nowrap" href={`/${product.categorySlug}`}>
            {product.category}
          </Link>
          {product.subcategory && product.subcategorySlug ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <Link
                className="whitespace-nowrap"
                href={`/${product.categorySlug}/${product.subcategorySlug}`}
              >
                {product.subcategory}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap text-melier-ink">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:gap-8">
          <div className="grid gap-3">
            <div
              className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none lg:hidden"
              onScroll={handleMobileGalleryScroll}
              ref={mobileGalleryRef}
            >
              {selectedVariant.images.length > 0 ? (
                selectedVariant.images.map((image, index) => (
                  <div className="w-full shrink-0 snap-center" key={image}>
                    <img
                      alt={`${product.name} na cor ${selectedVariant.color} foto ${index + 1}`}
                      className="aspect-square w-full object-cover"
                      src={image}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full shrink-0 snap-center">
                  <ProductImagePlaceholder className="aspect-square" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 lg:hidden">
              {selectedVariant.images.map((image, index) => (
                <button
                  aria-label={`Ir para foto ${index + 1}`}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    activeImage === image ? "bg-melier-ink" : "bg-black/15",
                  )}
                  key={image}
                  onClick={() => scrollToImage(image)}
                  type="button"
                />
              ))}
            </div>

            <div className="hidden lg:grid lg:grid-cols-[88px_minmax(0,1fr)] lg:gap-3">
              <div className="grid content-start gap-2">
                {selectedVariant.images.map((image, index) => (
                  <button
                    className={cn(
                      "block w-full overflow-hidden bg-transparent p-0 text-left leading-none transition",
                      activeImage === image
                        ? "ring-1 ring-melier-ink"
                        : "hover:ring-1 hover:ring-melier-rose",
                    )}
                    key={image}
                    onClick={() => setActiveImage(image)}
                    type="button"
                  >
                    <img
                      alt={`${product.name} foto ${index + 1}`}
                      className="aspect-square w-full object-cover"
                      src={image}
                    />
                  </button>
                ))}
              </div>

              <div className="relative">
                {activeImage ? (
                  <button
                    className="block w-full overflow-hidden bg-transparent p-0 text-left leading-none"
                    onClick={handleAdvanceImage}
                    type="button"
                  >
                    <img
                      alt={`${product.name} na cor ${selectedVariant.color}`}
                      className="w-full object-cover"
                      src={activeImage}
                    />
                  </button>
                ) : (
                  <ProductImagePlaceholder className="aspect-square" />
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-[1.75rem] bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black leading-tight text-melier-ink sm:text-[2rem]">
                    {product.name}
                  </h1>
                </div>
                {product.label ? (
                  <span className="rounded-full border border-melier-rose/20 bg-melier-rose/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-melier-rose">
                    {product.label}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex items-end gap-3">
                <p className="text-2xl font-black text-melier-ink">
                  {formatCurrency(product.price)}
                </p>
                {hasDiscount ? (
                  <>
                    <p className="pb-1 text-sm font-semibold text-muted-foreground line-through">
                      {formatCurrency(product.oldPrice!)}
                    </p>
                    <span className="mb-1 rounded-full border border-melier-rose/25 bg-melier-rose/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-melier-rose">
                      {discountPercent}% OFF
                    </span>
                  </>
                ) : null}
              </div>

              <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
                {product.shortDescription}
              </p>

              <div className="mt-5">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-melier-ink">
                  Cor
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.variants.map((variant) => {
                    const isActive = variant.slug === selectedVariant.slug;
                    const isOutOfStock = isVariantOutOfStock(variant.slug);

                    return (
                      <button
                        className={cn(
                          "flex min-h-12 items-center justify-between border px-3 py-3 text-left transition",
                          isOutOfStock
                            ? "border-black/10 bg-zinc-100/80"
                            : isActive
                            ? "border-melier-ink bg-white"
                            : "border-black/20 bg-white hover:border-melier-ink",
                        )}
                        key={variant.slug}
                        onClick={() => handleVariantChange(variant.slug)}
                        type="button"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              "h-4 w-4 rounded-full border border-black/10",
                              isOutOfStock ? "opacity-45 grayscale" : "",
                            )}
                            style={{ backgroundColor: variant.colorHex }}
                          />
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isOutOfStock ? "text-zinc-400" : "text-melier-ink",
                            )}
                          >
                            {variant.color}
                          </span>
                        </span>
                        {isActive ? (
                          <Check
                            className={cn(
                              "h-4 w-4",
                              isOutOfStock ? "text-zinc-400" : "text-melier-rose",
                            )}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-melier-ink">
                  Tamanho
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {product.sizes.map((size) => {
                    const isOutOfStock = isSizeOutOfStock(selectedVariant.slug, size);

                    return (
                      <button
                        className={cn(
                          "relative flex h-12 items-center justify-center overflow-hidden border px-3 text-sm font-extrabold uppercase tracking-[0.08em] transition",
                          isOutOfStock
                            ? "cursor-not-allowed border-black/10 bg-zinc-100 text-zinc-400"
                            : selectedSize === size
                            ? "border-melier-ink bg-melier-ink text-white"
                            : "border-black/20 bg-white text-melier-ink hover:border-melier-ink",
                        )}
                        disabled={isOutOfStock}
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setShowSizeError(false);
                        }}
                        type="button"
                      >
                        {size}
                        {isOutOfStock ? (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -left-2 top-1/2 h-px w-[calc(100%+1rem)] -translate-y-1/2 -rotate-[28deg] bg-zinc-500/80"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {selectedVariantOutOfStock ? (
                  <p className="mt-2 text-xs font-bold text-muted-foreground">
                    Esta cor está sem estoque no momento.
                  </p>
                ) : null}
                {showSizeError ? (
                  <p className="mt-2 text-xs font-bold text-melier-rose">
                    Escolha um tamanho para adicionar na sacola.
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-2">
                <Button
                  className={`h-11 w-full rounded-none transition-transform duration-300 ${
                    didAddRecently ? "scale-[1.01]" : ""
                  }`}
                  disabled={selectedVariantOutOfStock}
                  onClick={handleAddToCart}
                  type="button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {selectedVariantOutOfStock
                    ? "Sem estoque nesta cor"
                    : didAddRecently
                    ? "Adicionado"
                    : "Adicionar à sacola"}
                </Button>
                <Button
                  className="h-11 w-full rounded-none border-melier-rose bg-white text-melier-rose hover:bg-melier-rose/5 hover:text-melier-rose"
                  onClick={() => {
                    void toggleFavorite(product.slug);
                  }}
                  type="button"
                  variant="outline"
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                  {isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                </Button>
                {isAdmin ? (
                  <Button asChild className="h-11 w-full rounded-none" type="button" variant="outline">
                    <Link href={`/admin/produtos/editar/${product.slug}`}>Editar peça</Link>
                  </Button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 border-t pt-5">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-melier-ink">
                    Descrição
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {product.description}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-melier-ink">
                    Composição
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {product.composition}
                  </p>
                </div>
                {product.fitNote ? (
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-melier-ink">
                      Modelagem
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {product.fitNote}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
