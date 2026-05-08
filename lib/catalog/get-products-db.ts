import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducts, type ProductSort } from "@/lib/catalog/get-products";
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
  category_id: string;
};

type DbVariantRow = {
  product_id: string;
  color_id: string;
  size_id: string;
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
  const supabase = await createSupabaseServerClient();
  const [{ data: categories }, { data: productsData, error: productsError }] =
    await Promise.all([
      supabase.from("categories").select("id,name,slug,parent_id").eq("is_active", true),
      supabase
        .from("products")
        .select(
          "id,name,slug,description,composition,price_cents,old_price_cents,is_hot,category_id",
        )
        .eq("is_visible", true),
    ]);

  if (productsError) throw productsError;

  const typedProducts = (productsData ?? []) as DbProductRow[];
  const productIds = typedProducts.map((item) => item.id);
  if (productIds.length === 0) return [];

  const [{ data: variants }, { data: colors }, { data: sizes }] =
    await Promise.all([
      supabase
        .from("product_variants")
        .select("product_id,color_id,size_id")
        .in("product_id", productIds)
        .eq("is_available", true),
      supabase.from("colors").select("id,name,slug,hex_code"),
      supabase.from("sizes").select("id,name"),
    ]);

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

    const variantGroups = new Map<string, ProductVariant>();
    for (const variantRow of productVariants) {
      const color = colorsMap.get(variantRow.color_id);
      if (!color) continue;
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
          images: variantImages.length > 0 ? variantImages : ["/mock/product-shirt.svg"],
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

    mappedProducts.push({
      id: index + 1,
      slug: productRow.slug,
      name: productRow.name,
      category: categoryName,
      categorySlug,
      price: toCurrency(productRow.price_cents),
      oldPrice: productRow.old_price_cents ? toCurrency(productRow.old_price_cents) : undefined,
      label: productRow.is_hot ? "Novo" : undefined,
      shortDescription: productRow.description || "Peça da coleção atual da Meliar.",
      description: productRow.description || "Peça da coleção atual da Meliar.",
      composition: productRow.composition || "Composição não informada.",
      sizes: sizesList.length > 0 ? sizesList : ["P", "M", "G"],
      defaultVariantSlug: variantsList[0].slug,
      variants: variantsList,
      ...(subcategoryName ? { subcategory: subcategoryName } : {}),
      ...(subcategorySlug ? { subcategorySlug } : {}),
    });
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
  try {
    return await getCatalogFromDb(sort);
  } catch {
    return getProducts(sort);
  }
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
