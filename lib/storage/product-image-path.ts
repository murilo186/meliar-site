function normalizeStorageSegment(value: string, fallback: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || fallback;
}

export function buildProductImageFolder(productSlug: string, colorSlug?: string | null) {
  const safeProductSlug = normalizeStorageSegment(productSlug, "produto");
  const safeColorSlug = normalizeStorageSegment(colorSlug ?? "sem-cor", "sem-cor");
  return `products/${safeProductSlug}/${safeColorSlug}`;
}

export function buildCanonicalProductImagePath(
  productSlug: string,
  colorSlug: string | null | undefined,
  sequence: number,
) {
  const safeSequence = Number.isFinite(sequence) && sequence > 0 ? Math.floor(sequence) : 1;
  return `${buildProductImageFolder(productSlug, colorSlug)}/${safeSequence}.webp`;
}
