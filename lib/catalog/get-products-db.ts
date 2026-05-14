import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ProductSort } from "@/lib/catalog/types";
import { matchesNewArrivalRule } from "@/lib/catalog/new-arrivals-rule";
import type { Product, ProductVariant } from "@/types/product";

type DbCategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type DbProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  composition: string | null;
  price_cents: number;
  old_price_cents: number | null;
  is_hot: boolean;
  show_in_new_arrivals_manual: boolean;
  created_at: string;
  category_id: string;
};

type DbVariantRow = {
  product_id: string;
  color_id: string;
  size_id: string;
  stock_quantity: number;
  is_available: boolean;
};

type DbColorRow = {
  id: string;
  name: string;
  slug: string;
  hex_code: string | null;
};

type DbSizeRow = {
  id: string;
  name: string;
};

type DbImageRow = {
  product_id: string;
  color_id: string | null;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

function toCurrency(cents: number) {
  return cents / 100;
}

function normalizeHexColor(value?: string | null) {
  if (!value) return "#111111";
  return value.toUpperCase();
}

async function getCatalogFromDb(sort: ProductSort = "featured") {
  const supabase = createSupabaseServiceClient();
  const [
    { data: categories, error: categoriesError },
    { data: productsData, error: productsError },
  ] =
    await Promise.all([
      supabase.from("categories").select("id,name,slug,parent_id").eq("is_active", true),
      supabase
        .from("products")
        .select(
          "id,name,slug,description,composition,price_cents,old_price_cents,is_hot,show_in_new_arrivals_manual,created_at,category_id",
        )
        .eq("is_visible", true),
    ]);

  if (categoriesError) throw categoriesError;
  if (productsError) throw productsError;

  const typedProducts = (productsData ?? []) as DbProductRow[];
  const productIds = typedProducts.map((item) => item.id);
  if (productIds.length === 0) return [];

  const [
    { data: variants, error: variantsError },
    { data: colors, error: colorsError },
    { data: sizes, error: sizesError },
  ] =
    await Promise.all([
      supabase
        .from("product_variants")
        .select("product_id,color_id,size_id,stock_quantity,is_available")
        .in("product_id", productIds),
      supabase.from("colors").select("id,name,slug,hex_code"),
      supabase.from("sizes").select("id,name"),
    ]);

  if (variantsError) throw variantsError;
  if (colorsError) throw colorsError;
  if (sizesError) throw sizesError;

  const { data: imagesWithPrimary, error: imagesWithPrimaryError } = await supabase
    .from("product_images")
    .select("product_id,color_id,image_url,sort_order,is_primary")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  const images: DbImageRow[] =
    imagesWithPrimaryError == null
      ? ((imagesWithPrimary ?? []) as DbImageRow[])
      : (
          await supabase
            .from("product_images")
            .select("product_id,color_id,image_url,sort_order")
            .in("product_id", productIds)
            .order("sort_order", { ascending: true })
        ).data?.map((image) => ({ ...image, is_primary: false })) ?? [];

  const categoriesMap = new Map((categories ?? []).map((row) => [row.id, row] as const));
  const colorsMap = new Map(((colors ?? []) as DbColorRow[]).map((row) => [row.id, row] as const));
  const sizesMap = new Map(((sizes ?? []) as DbSizeRow[]).map((row) => [row.id, row] as const));

  const variantsByProduct = new Map<string, DbVariantRow[]>();
  for (const variant of (variants ?? []) as DbVariantRow[]) {
    const current = variantsByProduct.get(variant.product_id) ?? [];
    current.push(variant);
    variantsByProduct.set(variant.product_id, current);
  }

  const imagesByProduct = new Map<string, DbImageRow[]>();
  for (const image of images) {
    const current = imagesByProduct.get(image.product_id) ?? [];
    current.push(image);
    imagesByProduct.set(image.product_id, current);
  }

  const mappedProducts: Product[] = [];
  for (const [index, productRow] of typedProducts.entries()) {
    const category = categoriesMap.get(productRow.category_id) as DbCategoryRow | undefined;
    if (!category) continue;

    const parentCategory = category.parent_id
      ? (categoriesMap.get(category.parent_id) as DbCategoryRow | undefined)
      : undefined;

    const categorySlug = parentCategory?.slug ?? category.slug;
    const categoryName = parentCategory?.name ?? category.name;
    const subcategorySlug = parentCategory ? category.slug : undefined;
    const subcategoryName = parentCategory ? category.name : undefined;

    const productVariants = variantsByProduct.get(productRow.id) ?? [];
    const imagesForProduct = imagesByProduct.get(productRow.id) ?? [];
    const stockByVariantSlug: Record<string, Record<string, number>> = {};

    const variantGroups = new Map<string, ProductVariant>();
    for (const variantRow of productVariants) {
      const color = colorsMap.get(variantRow.color_id);
      const sizeName = sizesMap.get(variantRow.size_id)?.name;
      if (!color) continue;

      if (sizeName) {
        const variantStock = stockByVariantSlug[color.slug] ?? {};
        variantStock[sizeName] = variantRow.is_available ? variantRow.stock_quantity : 0;
        stockByVariantSlug[color.slug] = variantStock;
      }

      if (!variantGroups.has(color.id)) {
        const variantImages = imagesForProduct
          .filter((img) => img.color_id === color.id || img.color_id === null)
          .sort((left, right) => {
            if (left.is_primary === right.is_primary) return left.sort_order - right.sort_order;
            return left.is_primary ? -1 : 1;
          })
          .map((img) => img.image_url);
        variantGroups.set(color.id, {
          slug: color.slug,
          color: color.name,
          colorHex: normalizeHexColor(color.hex_code),
          images: variantImages,
        });
      }
    }

    const sizesList = Array.from(
      new Set(
        productVariants
          .map((row) => sizesMap.get(row.size_id)?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    );

    const variantsList = Array.from(variantGroups.values());
    if (variantsList.length === 0) continue;
    const hasStockByVariant = Object.keys(stockByVariantSlug).length > 0;
    const isNewArrival = matchesNewArrivalRule({
      isHot: productRow.is_hot,
      showInNewArrivalsManual: productRow.show_in_new_arrivals_manual,
      createdAt: productRow.created_at,
    });

    mappedProducts.push({
      id: index + 1,
      slug: productRow.slug,
      name: productRow.name,
      isHot: productRow.is_hot,
      showInNewArrivalsManual: productRow.show_in_new_arrivals_manual,
      createdAt: productRow.created_at,
      category: categoryName,
      categorySlug,
      price: toCurrency(productRow.price_cents),
      oldPrice: productRow.old_price_cents ? toCurrency(productRow.old_price_cents) : undefined,
      label: isNewArrival ? "Novo" : undefined,
      shortDescription: productRow.description || "Peça da coleção atual da Meliar.",
      description: productRow.description || "Peça da coleção atual da Meliar.",
      composition: productRow.composition || "Composição não informada.",
      sizes: sizesList,
      defaultVariantSlug: variantsList[0].slug,
      variants: variantsList,
      ...(hasStockByVariant ? { stockByVariantSlug } : {}),
      ...(subcategoryName ? { subcategory: subcategoryName } : {}),
      ...(subcategorySlug ? { subcategorySlug } : {}),
    });
  }

  if (mappedProducts.length === 0 && typedProducts.length > 0) {
    throw new Error("Catalog mapping produced 0 products from non-empty DB result.");
  }

  return [...mappedProducts].sort((left, right) => {
    switch (sort) {
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "name-asc":
        return left.name.localeCompare(right.name, "pt-BR");
      case "name-desc":
        return right.name.localeCompare(left.name, "pt-BR");
      default:
        return 0;
    }
  });
}

export async function getProductsFromDb(sort: ProductSort = "featured") {
  return getCatalogFromDb(sort);
}

export async function getProductsByCategoryFromDb(categorySlug: string, sort: ProductSort = "featured") {
  const all = await getProductsFromDb(sort);
  return all.filter((p) => p.categorySlug === categorySlug);
}

export async function getProductsBySubcategoryFromDb(
  categorySlug: string,
  subcategorySlug: string,
  sort: ProductSort = "featured",
) {
  const all = await getProductsFromDb(sort);
  return all.filter((p) => p.categorySlug === categorySlug && p.subcategorySlug === subcategorySlug);
}

export async function getProductBySlugFromDb(slug: string) {
  const all = await getProductsFromDb("featured");
  return all.find((p) => p.slug === slug);
}

export async function getRelatedProductsFromDb(product: Product, limit = 4) {
  const all = await getProductsFromDb("featured");
  return all
    .filter(
      (item) =>
        item.slug !== product.slug &&
        (item.subcategorySlug === product.subcategorySlug || item.categorySlug === product.categorySlug),
    )
    .slice(0, limit);
}
