"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getDefaultVariant,
  getProductPrimaryImage,
} from "@/lib/catalog/get-products";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "editorial";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const isEditorial = variant === "editorial";
  const defaultVariant = getDefaultVariant(product);
  const productImage = getProductPrimaryImage(product);
  const colorCount = product.variants.length;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
    }
    void loadRole();
  }, []);

  return (
    <article
      className={
        isEditorial
          ? "group overflow-hidden bg-white"
          : "group overflow-hidden rounded-2xl border bg-card"
      }
    >
      <Link className="block" href={`/produto/${product.slug}`}>
        <div
          className={`relative overflow-hidden ${
            isEditorial ? "aspect-[0.73] bg-[#f6f1ea]" : "aspect-[4/5] bg-muted"
          }`}
        >
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            src={productImage}
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
            type="button"
            variant="ghost"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>
      <div className={isEditorial ? "grid gap-3 px-0 py-3" : "grid gap-3 p-3"}>
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
              {colorCount > 1
                ? `${colorCount} cores disponíveis`
                : defaultVariant.color}
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
          <p
            className={`text-xs ${
              isEditorial ? "font-semibold text-melier-ink" : "font-bold text-muted-foreground"
            }`}
          >
            {product.oldPrice ? (
              <>
                <span className="mr-2 line-through text-muted-foreground">
                  {formatCurrency(product.oldPrice)}
                </span>
                <span>{formatCurrency(product.price)}</span>
              </>
            ) : (
              isEditorial ? formatCurrency(product.price) : "Escolha cor e tamanho"
            )}
          </p>
          <Button asChild className={isEditorial ? "w-full rounded-none" : undefined} size="sm" variant="outline">
            <Link href={`/produto/${product.slug}`}>Ver peça</Link>
          </Button>
          {isAdmin ? (
            <Button asChild className={isEditorial ? "w-full rounded-none" : undefined} size="sm" variant="outline">
              <Link href={`/admin/produtos/editar/${product.slug}`}>Editar peça</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
