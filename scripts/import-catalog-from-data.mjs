#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createClient } from "@supabase/supabase-js";

function loadProductsFromDataFile() {
  const filePath = path.join(process.cwd(), "data/products.ts");
  let source = fs.readFileSync(filePath, "utf8");
  source = source.replace(/^import[^\n]*\n/, "");
  source = source.replace("export const products: Product[] =", "const products =");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.__products = products;`, context);
  return context.__products ?? [];
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function skuPart(value, max = 6) {
  return slugify(value).replace(/-/g, "").toUpperCase().slice(0, max);
}

function toCents(value) {
  if (value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number * 100);
}

function getCategorySlug(product) {
  return product.subcategorySlug || product.categorySlug;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  }

  const products = loadProductsFromDataFile();
  if (products.length === 0) {
    throw new Error("No products found in data/products.ts");
  }

  const supabase = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const categorySlugs = Array.from(new Set(products.map(getCategorySlug).filter(Boolean)));
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id,slug")
    .in("slug", categorySlugs);
  if (categoriesError) throw categoriesError;
  const categoryBySlug = new Map((categories ?? []).map((item) => [item.slug, item.id]));

  const missingCategories = categorySlugs.filter((slug) => !categoryBySlug.has(slug));
  if (missingCategories.length > 0) {
    throw new Error(`Missing categories in DB: ${missingCategories.join(", ")}`);
  }

  const colorRows = [];
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      colorRows.push({
        slug: variant.slug,
        name: variant.color,
        hex_code: variant.colorHex || "#111111",
        is_active: true,
      });
    }
  }
  const uniqueColors = Array.from(
    new Map(colorRows.map((row) => [row.slug, row])).values(),
  );
  if (uniqueColors.length > 0) {
    const { error } = await supabase.from("colors").upsert(uniqueColors, { onConflict: "slug" });
    if (error) throw error;
  }

  const sizeOrder = new Map([
    ["pp", 5],
    ["p", 10],
    ["m", 20],
    ["g", 30],
    ["gg", 35],
    ["36", 40],
    ["38", 50],
    ["40", 60],
    ["42", 70],
    ["44", 80],
    ["46", 90],
  ]);
  const sizeRows = Array.from(
    new Map(
      products
        .flatMap((product) => product.sizes ?? [])
        .map((sizeName) => {
          const slug = slugify(sizeName);
          return [
            slug,
            {
              slug,
              name: sizeName,
              sort_order: sizeOrder.get(slug) ?? 999,
              is_active: true,
            },
          ];
        }),
    ).values(),
  );
  if (sizeRows.length > 0) {
    const { error } = await supabase.from("sizes").upsert(sizeRows, { onConflict: "slug" });
    if (error) throw error;
  }

  const productRows = products.map((product) => ({
    name: product.name,
    slug: product.slug,
    category_id: categoryBySlug.get(getCategorySlug(product)),
    description: product.description ?? product.shortDescription ?? product.name,
    composition: product.composition ?? null,
    price_cents: toCents(product.price),
    old_price_cents: toCents(product.oldPrice),
    is_visible: true,
    is_hot: product.label === "Novo",
    show_in_new_arrivals_manual: product.label === "Novo",
  }));
  const { error: productUpsertError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "slug" });
  if (productUpsertError) throw productUpsertError;

  const { data: productsDb, error: productsDbError } = await supabase
    .from("products")
    .select("id,slug,name")
    .in(
      "slug",
      products.map((product) => product.slug),
    );
  if (productsDbError) throw productsDbError;
  const productBySlug = new Map((productsDb ?? []).map((item) => [item.slug, item]));
  const productIds = (productsDb ?? []).map((item) => item.id);

  if (productIds.length > 0) {
    const { error: deleteImagesError } = await supabase
      .from("product_images")
      .delete()
      .in("product_id", productIds);
    if (deleteImagesError) throw deleteImagesError;

    const { error: deleteVariantsError } = await supabase
      .from("product_variants")
      .delete()
      .in("product_id", productIds);
    if (deleteVariantsError) throw deleteVariantsError;
  }

  const { data: colorsDb, error: colorsDbError } = await supabase
    .from("colors")
    .select("id,slug");
  if (colorsDbError) throw colorsDbError;
  const colorBySlug = new Map((colorsDb ?? []).map((item) => [item.slug, item.id]));

  const { data: sizesDb, error: sizesDbError } = await supabase
    .from("sizes")
    .select("id,slug");
  if (sizesDbError) throw sizesDbError;
  const sizeBySlug = new Map((sizesDb ?? []).map((item) => [item.slug, item.id]));

  const variantRows = [];
  const imageRows = [];

  for (const product of products) {
    const productDb = productBySlug.get(product.slug);
    if (!productDb) continue;

    for (const variant of product.variants ?? []) {
      const colorId = colorBySlug.get(variant.slug);
      if (!colorId) continue;

      for (const sizeName of product.sizes ?? []) {
        const sizeSlug = slugify(sizeName);
        const sizeId = sizeBySlug.get(sizeSlug);
        if (!sizeId) continue;
        variantRows.push({
          product_id: productDb.id,
          color_id: colorId,
          size_id: sizeId,
          sku: `MLR-${skuPart(product.slug, 8)}-${skuPart(variant.slug, 4)}-${skuPart(sizeSlug, 4)}`,
          price_cents: null,
          stock_quantity: 0,
          is_available: true,
        });
      }

      const images = (variant.images ?? []).slice(0, 3);
      images.forEach((imageUrl, index) => {
        const ext = path.extname(imageUrl) || ".webp";
        imageRows.push({
          product_id: productDb.id,
          color_id: colorId,
          image_url: imageUrl,
          storage_path: `seed/${product.slug}/${variant.slug}/${index + 1}${ext}`,
          sort_order: index,
          is_primary: index === 0,
        });
      });
    }
  }

  if (variantRows.length > 0) {
    const { error } = await supabase.from("product_variants").insert(variantRows);
    if (error) throw error;
  }

  if (imageRows.length > 0) {
    const { error } = await supabase.from("product_images").insert(imageRows);
    if (error) {
      const fallbackRows = imageRows.map(({ is_primary, ...row }) => row);
      const fallback = await supabase.from("product_images").insert(fallbackRows);
      if (fallback.error) throw fallback.error;
    }
  }

  console.log(
    `Import complete: ${productRows.length} products, ${variantRows.length} variants, ${imageRows.length} images.`,
  );
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
