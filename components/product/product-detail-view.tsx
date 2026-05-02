"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/use-cart";
import { Button } from "@/components/ui/button";
import { getDefaultVariant } from "@/lib/catalog/get-products";
import { formatCurrency } from "@/lib/format";
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
  const { addItem } = useCart();

  const selectedVariant = useMemo(
    () =>
      product.variants.find((variant) => variant.slug === selectedVariantSlug) ??
      defaultVariant,
    [defaultVariant, product.variants, selectedVariantSlug],
  );

  const hasDiscount = typeof product.oldPrice === "number" && product.oldPrice > product.price;

  const handleVariantChange = (variantSlug: string) => {
    const variant =
      product.variants.find((item) => item.slug === variantSlug) ?? defaultVariant;

    setSelectedVariantSlug(variant.slug);
    setActiveImage(variant.images[0]);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    addItem({
      id: `${product.slug}:${selectedVariant.slug}:${selectedSize}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price,
      image: activeImage,
      color: selectedVariant.color,
      size: selectedSize,
    });

    setShowSizeError(false);
  };

  return (
    <section className="bg-white py-4 sm:py-6">
      <div className="container">
        <nav className="mb-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <Link href="/produtos">Loja</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/${product.categorySlug}`}>{product.category}</Link>
          {product.subcategory && product.subcategorySlug ? (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/${product.categorySlug}/${product.subcategorySlug}`}>
                {product.subcategory}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-melier-ink">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:gap-8">
          <div className="grid gap-3">
            <div className="overflow-hidden rounded-[1.75rem] bg-[#f6f1ea]">
              <img
                alt={`${product.name} na cor ${selectedVariant.color}`}
                className="aspect-[4/5] w-full object-cover"
                src={activeImage}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {selectedVariant.images.map((image, index) => (
                <button
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-[#f6f1ea] transition",
                    activeImage === image
                      ? "border-melier-ink"
                      : "border-transparent hover:border-melier-rose",
                  )}
                  key={image}
                  onClick={() => setActiveImage(image)}
                  type="button"
                >
                  <img
                    alt={`${product.name} foto ${index + 1}`}
                    className="aspect-[4/5] w-full object-cover"
                    src={image}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-[1.75rem] border border-black/10 bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
                    {product.category}
                  </p>
                  <h1 className="mt-2 text-2xl font-black leading-tight text-melier-ink sm:text-[2rem]">
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
                  <p className="pb-1 text-sm font-bold text-muted-foreground line-through">
                    {formatCurrency(product.oldPrice!)}
                  </p>
                ) : null}
              </div>

              <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
                {product.shortDescription}
              </p>

              <div className="mt-5 grid gap-2 rounded-2xl bg-[#fcf7f8] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-muted-foreground">Cor selecionada</span>
                  <span className="font-bold text-melier-ink">{selectedVariant.color}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-muted-foreground">Fotos desta cor</span>
                  <span className="font-bold text-melier-ink">
                    {selectedVariant.images.length} imagens
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-melier-ink">
                    Cor
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Troque para ver outras fotos
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.variants.map((variant) => {
                    const isActive = variant.slug === selectedVariant.slug;

                    return (
                      <button
                        className={cn(
                          "flex items-center justify-between rounded-2xl border px-3 py-3 text-left transition",
                          isActive
                            ? "border-melier-ink bg-white"
                            : "border-black/10 bg-white hover:border-melier-rose",
                        )}
                        key={variant.slug}
                        onClick={() => handleVariantChange(variant.slug)}
                        type="button"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="h-4 w-4 rounded-full border border-black/10"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                          <span className="text-sm font-bold text-melier-ink">
                            {variant.color}
                          </span>
                        </span>
                        {isActive ? <Check className="h-4 w-4 text-melier-rose" /> : null}
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
                  {product.sizes.map((size) => (
                    <button
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-sm font-extrabold transition",
                        selectedSize === size
                          ? "border-melier-ink bg-melier-ink text-white"
                          : "border-black/10 text-melier-ink hover:border-melier-rose hover:text-melier-rose",
                      )}
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setShowSizeError(false);
                      }}
                      type="button"
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {showSizeError ? (
                  <p className="mt-2 text-xs font-bold text-melier-rose">
                    Escolha um tamanho para adicionar na sacola.
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-2">
                <Button className="h-11 w-full rounded-full" onClick={handleAddToCart} type="button">
                  <ShoppingBag className="h-4 w-4" />
                  Adicionar à sacola
                </Button>
                <Button asChild className="h-11 w-full rounded-full" variant="outline">
                  <Link href="/produtos">Continuar comprando</Link>
                </Button>
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
