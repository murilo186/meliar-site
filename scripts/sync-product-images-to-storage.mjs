import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function toWebpPath(filePath) {
  const ext = path.extname(filePath);
  if (!ext) return `${filePath}.webp`;
  if (ext.toLowerCase() === ".webp") return filePath;
  return `${filePath.slice(0, -ext.length)}.webp`;
}

function normalizeStoragePath(value) {
  return value.replaceAll("\\", "/");
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "product-images";
  const imagesRoot = path.resolve(process.cwd(), "images");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: rows, error: rowsError } = await supabase
    .from("product_images")
    .select("id,image_url,storage_path")
    .order("sort_order", { ascending: true });

  if (rowsError) {
    throw rowsError;
  }

  if (!rows || rows.length === 0) {
    console.log("No rows found in product_images.");
    return;
  }

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (const row of rows) {
    try {
      const imageUrl = String(row.image_url || "").trim();
      if (!imageUrl.startsWith("/images/")) {
        skipped += 1;
        continue;
      }

      const relativePath = imageUrl.slice("/images/".length);
      const relativeWebpPath = normalizeStoragePath(toWebpPath(relativePath));
      const localWebpPath = path.join(imagesRoot, relativeWebpPath);

      if (!fs.existsSync(localWebpPath)) {
        failed += 1;
        failures.push({
          id: row.id,
          reason: "missing-local-webp",
          localWebpPath,
        });
        continue;
      }

      const storagePathFromDb = String(row.storage_path || "").trim();
      const targetStoragePath = storagePathFromDb
        ? normalizeStoragePath(toWebpPath(storagePathFromDb))
        : `seed/${relativeWebpPath}`;

      const fileBuffer = fs.readFileSync(localWebpPath);
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(targetStoragePath, fileBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        failed += 1;
        failures.push({
          id: row.id,
          reason: "upload-error",
          message: uploadError.message,
          targetStoragePath,
        });
        continue;
      }

      uploaded += 1;
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(targetStoragePath);
      const newImageUrl = publicUrlData.publicUrl;

      const shouldUpdate =
        row.image_url !== newImageUrl || row.storage_path !== targetStoragePath;

      if (shouldUpdate) {
        const { error: updateError } = await supabase
          .from("product_images")
          .update({
            image_url: newImageUrl,
            storage_path: targetStoragePath,
          })
          .eq("id", row.id);

        if (updateError) {
          failed += 1;
          failures.push({
            id: row.id,
            reason: "db-update-error",
            message: updateError.message,
          });
          continue;
        }
        updated += 1;
      }
    } catch (error) {
      failed += 1;
      failures.push({
        id: row.id,
        reason: "unexpected-error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const { data: rootList, error: listError } = await supabase.storage
    .from(bucket)
    .list("", { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });

  console.log(
    JSON.stringify(
      {
        bucket,
        rows: rows.length,
        uploaded,
        updated,
        skipped,
        failed,
        rootItems: rootList?.length ?? 0,
        rootListError: listError?.message ?? null,
        failures: failures.slice(0, 30),
      },
      null,
      2,
    ),
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
