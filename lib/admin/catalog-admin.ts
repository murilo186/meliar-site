import { AdminCategory, AdminProduct } from "@/types/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HIGHLIGHT_PRODUCTS_LIMIT } from "@/lib/catalog/highlight-limits";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  price_cents: number;
  old_price_cents: number | null;
  is_visible: boolean;
  is_hot: boolean;
  show_in_new_arrivals_manual: boolean;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
  product_images: { id: string; color_id: string | null }[] | null;
  product_variants: { id: string; color_id: string }[] | null;
};

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  const categories = (data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    is_active: boolean;
  }>;

  const byId = new Map(categories.map((category) => [category.id, category]));
  const parentIdsWithChildren = new Set(
    categories.map((category) => category.parent_id).filter(Boolean) as string[],
  );

  // Only leaf categories should be selectable in admin.
  const leafCategories = categories.filter(
    (category) => !parentIdsWithChildren.has(category.id),
  );

  return leafCategories.map((category) => {
    const parent = category.parent_id ? byId.get(category.parent_id) : null;
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parent_id,
      displayName: parent ? `${parent.name} > ${category.name}` : category.name,
    };
  });
}

export async function getAdminProductsByCategory(
  categoryId?: string,
  search?: string,
  showHiddenOnly = false,
): Promise<AdminProduct[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, category_id, price_cents, old_price_cents, is_visible, is_hot, show_in_new_arrivals_manual, created_at, categories(name), product_images(id,color_id), product_variants(id,color_id)",
    )
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  query = query.eq("is_visible", showHiddenOnly ? false : true);

  const { data, error } = await query;
  if (error) throw error;

  const mappedProducts = ((data ?? []) as ProductRow[]).map((row) => {
    const rawCategory = row.categories;
    const categoryObj = Array.isArray(rawCategory)
      ? rawCategory[0]
      : rawCategory;

    const variantColorIds = new Set((row.product_variants ?? []).map((variant) => variant.color_id));
    const imageColorIds = new Set(
      (row.product_images ?? [])
        .map((image) => image.color_id)
        .filter((colorId): colorId is string => Boolean(colorId)),
    );
    const hasVariantWithoutImage =
      variantColorIds.size > 0 &&
      Array.from(variantColorIds).some((colorId) => !imageColorIds.has(colorId));

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      categoryId: row.category_id,
      categoryName: categoryObj?.name ?? "Sem categoria",
      priceCents: row.price_cents,
      oldPriceCents: row.old_price_cents,
      isVisible: row.is_visible,
      isHot: row.is_hot,
      showInNewArrivalsManual: row.show_in_new_arrivals_manual,
      createdAt: row.created_at,
      imagesCount: row.product_images?.length ?? 0,
      hasVariantWithoutImage,
    };
  });

  return mappedProducts.sort((left, right) => {
    const leftHighlightScore = Number(left.isHot) + Number(left.showInNewArrivalsManual);
    const rightHighlightScore = Number(right.isHot) + Number(right.showInNewArrivalsManual);
    if (rightHighlightScore !== leftHighlightScore) {
      return rightHighlightScore - leftHighlightScore;
    }

    const leftCreatedAt = new Date(left.createdAt).getTime();
    const rightCreatedAt = new Date(right.createdAt).getTime();
    return rightCreatedAt - leftCreatedAt;
  });
}

export async function getAdminHighlightCounts() {
  const supabase = await createSupabaseServerClient();
  const [{ count: hotCount, error: hotError }, { count: newArrivalsCount, error: newError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_hot", true),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("show_in_new_arrivals_manual", true),
    ]);

  if (hotError) throw hotError;
  if (newError) throw newError;

  return {
    hot: hotCount ?? 0,
    newArrivals: newArrivalsCount ?? 0,
    max: HIGHLIGHT_PRODUCTS_LIMIT,
  };
}

export async function getAdminColors() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("colors")
    .select("id,name,slug,hex_code")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminSizes() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sizes")
    .select("id,name,slug,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
