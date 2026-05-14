const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET ?? "product-images";

const publicStorageBaseUrl = supabaseUrl
  ? `${supabaseUrl}/storage/v1/object/public/${bucket}`
  : "";

export function buildStoragePublicUrl(storagePath: string) {
  const normalizedPath = storagePath.replace(/^\/+/, "");
  if (!publicStorageBaseUrl) return `/${normalizedPath}`;
  return `${publicStorageBaseUrl}/${normalizedPath}`;
}

export const brandAssets = {
  logoHeader: buildStoragePublicUrl("assets/logo/logo_header1.png"),
  logoComplete: buildStoragePublicUrl("assets/logo/logocompleta.png"),
  favicon: buildStoragePublicUrl("assets/logo/favicon.png"),
  heroDesktop: buildStoragePublicUrl("assets/hero/desktop_hero.webp"),
  heroMobile: buildStoragePublicUrl("assets/hero/mobile_hero.webp"),
  categoryVestidos: buildStoragePublicUrl("assets/categories/category_vestidos.webp"),
  categoryCalcas: buildStoragePublicUrl("assets/categories/category_calcas.webp"),
  categorySaias: buildStoragePublicUrl("assets/categories/category_saias.webp"),
  categoryCroppeds: buildStoragePublicUrl("assets/categories/category_croppeds.webp"),
  categoryConjuntos: buildStoragePublicUrl("assets/categories/category_conjuntos.webp"),
};
