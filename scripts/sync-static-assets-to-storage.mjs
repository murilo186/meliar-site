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

const assetsToSync = [
  {
    localPath: "images/logo/logo_header1.png",
    storagePath: "assets/logo/logo_header1.png",
    contentType: "image/png",
  },
  {
    localPath: "images/logo/logocompleta.png",
    storagePath: "assets/logo/logocompleta.png",
    contentType: "image/png",
  },
  {
    localPath: "images/logo/favicon.png",
    storagePath: "assets/logo/favicon.png",
    contentType: "image/png",
  },
  {
    localPath: "images/hero/desktop_hero.webp",
    storagePath: "assets/hero/desktop_hero.webp",
    contentType: "image/webp",
  },
  {
    localPath: "images/hero/mobile_hero.webp",
    storagePath: "assets/hero/mobile_hero.webp",
    contentType: "image/webp",
  },
  {
    localPath: "images/roupas/categories/category_vestidos.webp",
    storagePath: "assets/categories/category_vestidos.webp",
    contentType: "image/webp",
  },
  {
    localPath: "images/roupas/categories/category_calcas.webp",
    storagePath: "assets/categories/category_calcas.webp",
    contentType: "image/webp",
  },
  {
    localPath: "images/roupas/categories/category_saias.webp",
    storagePath: "assets/categories/category_saias.webp",
    contentType: "image/webp",
  },
  {
    localPath: "images/roupas/categories/category_croppeds.webp",
    storagePath: "assets/categories/category_croppeds.webp",
    contentType: "image/webp",
  },
  {
    localPath: "images/roupas/categories/category_conjuntos.webp",
    storagePath: "assets/categories/category_conjuntos.webp",
    contentType: "image/webp",
  },
];

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "product-images";
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let uploaded = 0;
  let failed = 0;
  const failures = [];

  for (const asset of assetsToSync) {
    const absoluteLocalPath = path.resolve(process.cwd(), asset.localPath);
    if (!fs.existsSync(absoluteLocalPath)) {
      failed += 1;
      failures.push({ asset: asset.localPath, reason: "missing-local-file" });
      continue;
    }

    const fileBuffer = fs.readFileSync(absoluteLocalPath);
    const { error } = await supabase.storage.from(bucket).upload(asset.storagePath, fileBuffer, {
      upsert: true,
      contentType: asset.contentType,
    });

    if (error) {
      failed += 1;
      failures.push({
        asset: asset.localPath,
        storagePath: asset.storagePath,
        reason: error.message,
      });
      continue;
    }

    uploaded += 1;
  }

  const { data: assetsList, error: assetsListError } = await supabase.storage
    .from(bucket)
    .list("assets", { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });

  console.log(
    JSON.stringify(
      {
        bucket,
        expected: assetsToSync.length,
        uploaded,
        failed,
        assetsRootItems: assetsList?.length ?? 0,
        assetsListError: assetsListError?.message ?? null,
        failures,
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
