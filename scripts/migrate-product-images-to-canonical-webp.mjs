import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function normalizeStorageSegment(value, fallback) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || fallback;
}

function buildCanonicalPath(productSlug, colorSlug, sequence) {
  const safeProduct = normalizeStorageSegment(productSlug, "produto");
  const safeColor = normalizeStorageSegment(colorSlug || "sem-cor", "sem-cor");
  const safeSequence = Number.isFinite(sequence) && sequence > 0 ? Math.floor(sequence) : 1;
  return `products/${safeProduct}/${safeColor}/${safeSequence}.webp`;
}

async function readSourceBuffer({ supabase, bucket, storagePath, imageUrl, imagesRoot }) {
  if (storagePath) {
    const { data, error } = await supabase.storage.from(bucket).download(storagePath);
    if (!error && data) {
      return Buffer.from(await data.arrayBuffer());
    }
  }

  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    const response = await fetch(imageUrl);
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
  }

  if (imageUrl && imageUrl.startsWith("/images/")) {
    const relative = imageUrl.slice("/images/".length);
    const local = path.join(imagesRoot, relative);
    if (fs.existsSync(local)) {
      return fs.readFileSync(local);
    }
  }

  return null;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "product-images";
  const imagesRoot = path.resolve(process.cwd(), "images");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [{ data: imageRows, error: imageRowsError }, { data: products, error: productsError }, { data: colors, error: colorsError }] =
    await Promise.all([
      supabase
        .from("product_images")
        .select("id,product_id,color_id,image_url,storage_path,sort_order,created_at")
        .order("created_at", { ascending: true }),
      supabase.from("products").select("id,slug"),
      supabase.from("colors").select("id,slug"),
    ]);

  if (imageRowsError) throw imageRowsError;
  if (productsError) throw productsError;
  if (colorsError) throw colorsError;

  const productSlugById = new Map((products || []).map((row) => [row.id, row.slug]));
  const colorSlugById = new Map((colors || []).map((row) => [row.id, row.slug]));

  const grouped = new Map();
  for (const row of imageRows || []) {
    const key = `${row.product_id}:${row.color_id || "sem-cor"}`;
    const current = grouped.get(key) || [];
    current.push(row);
    grouped.set(key, current);
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (const rows of grouped.values()) {
    rows.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      if (a.created_at !== b.created_at) return String(a.created_at).localeCompare(String(b.created_at));
      return String(a.id).localeCompare(String(b.id));
    });

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const productSlug = productSlugById.get(row.product_id);
      const colorSlug = row.color_id ? colorSlugById.get(row.color_id) : null;

      if (!productSlug) {
        failed += 1;
        failures.push({ id: row.id, reason: "missing-product-slug" });
        continue;
      }

      const targetPath = buildCanonicalPath(productSlug, colorSlug, index + 1);
      const currentPath = String(row.storage_path || "");
      const currentUrl = String(row.image_url || "");
      const looksCanonical =
        currentPath === targetPath &&
        currentPath.toLowerCase().endsWith(".webp") &&
        currentUrl.includes(`/storage/v1/object/public/${bucket}/${targetPath}`);

      if (looksCanonical) {
        skipped += 1;
        continue;
      }

      const sourceBuffer = await readSourceBuffer({
        supabase,
        bucket,
        storagePath: currentPath,
        imageUrl: currentUrl,
        imagesRoot,
      });

      if (!sourceBuffer) {
        failed += 1;
        failures.push({
          id: row.id,
          reason: "source-not-found",
          imageUrl: currentUrl,
          storagePath: currentPath,
        });
        continue;
      }

      const webpBuffer = await sharp(sourceBuffer).rotate().webp({ quality: 82 }).toBuffer();

      const { error: uploadError } = await supabase.storage.from(bucket).upload(targetPath, webpBuffer, {
        upsert: true,
        contentType: "image/webp",
      });

      if (uploadError) {
        failed += 1;
        failures.push({ id: row.id, reason: "upload-error", message: uploadError.message });
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(targetPath);
      const { error: updateError } = await supabase
        .from("product_images")
        .update({
          image_url: publicUrlData.publicUrl,
          storage_path: targetPath,
          sort_order: index,
        })
        .eq("id", row.id);

      if (updateError) {
        failed += 1;
        failures.push({ id: row.id, reason: "db-update-error", message: updateError.message });
        continue;
      }

      if (currentPath && currentPath !== targetPath) {
        await supabase.storage.from(bucket).remove([currentPath]);
      }

      migrated += 1;
    }
  }

  const { data: finalRows, error: finalError } = await supabase
    .from("product_images")
    .select("id,image_url,storage_path");

  if (finalError) throw finalError;

  const nonCanonical = (finalRows || []).filter((row) => {
    const storagePath = String(row.storage_path || "");
    const imageUrl = String(row.image_url || "");
    return (
      !storagePath.startsWith("products/") ||
      !storagePath.endsWith(".webp") ||
      !imageUrl.includes(`/storage/v1/object/public/${bucket}/products/`) ||
      !imageUrl.endsWith(".webp")
    );
  });

  console.log(
    JSON.stringify(
      {
        bucket,
        totalRows: imageRows?.length || 0,
        migrated,
        skipped,
        failed,
        nonCanonicalRows: nonCanonical.length,
        failures: failures.slice(0, 30),
      },
      null,
      2,
    ),
  );

  if (failed > 0 || nonCanonical.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
