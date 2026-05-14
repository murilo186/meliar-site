import type { Product, ProductVariant } from "@/types/product";

export function getDefaultVariant(product: Product): ProductVariant {
  const variant =
    product.variants.find((item) => item.slug === product.defaultVariantSlug) ??
    product.variants[0];

  if (!variant) {
    throw new Error(`Product ${product.slug} does not have variants.`);
  }

  return variant;
}

export function getVariantBySlug(product: Product, variantSlug?: string) {
  return (
    product.variants.find((variant) => variant.slug === variantSlug) ??
    getDefaultVariant(product)
  );
}

export function getProductPrimaryImage(product: Product, variantSlug?: string) {
  return getVariantBySlug(product, variantSlug).images[0];
}
