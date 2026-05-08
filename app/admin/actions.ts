"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseProductsBucket } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_IMAGES_PER_PRODUCT = 3;

function getRedirectTarget(formData: FormData, fallbackPath: string) {
  const redirectTo = String(formData.get("redirectTo") || "").trim();
  if (!redirectTo) return fallbackPath;
  if (!redirectTo.startsWith("/admin")) return fallbackPath;
  return redirectTo;
}

function redirectWithNotice(path: string, ok: boolean, message: string): never {
  const params = new URLSearchParams({
    status: ok ? "success" : "error",
    message,
  });
  return redirect(`${path}?${params.toString()}`);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function skuPart(value: string, max = 6) {
  return slugify(value).replace(/-/g, "").toUpperCase().slice(0, max);
}

function toCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  const floatValue = Number(normalized);
  if (!Number.isFinite(floatValue) || floatValue <= 0) return null;
  return Math.round(floatValue * 100);
}

function applyDiscount(priceCents: number, discountPercent: number) {
  if (discountPercent <= 0) return null;
  return Math.round(priceCents / (1 - discountPercent / 100));
}

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const composition = String(formData.get("composition") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const colorId = String(
    formData.get("colorId") || formData.get("colorIdDesktop") || "",
  ).trim();
  const sizeIds = formData
    .getAll("sizeIds")
    .map((value) => String(value))
    .filter(Boolean);
  const priceCents = toCents(String(formData.get("price") || ""));
  const discountPercent = Number(formData.get("discountPercent") || 0);

  if (!name || !description || !categoryId || !colorId || !priceCents || sizeIds.length === 0) {
    return { ok: false, message: "Preencha nome, descrição, categoria, cor, tamanho e preço." };
  }

  if (![0, 5, 10, 15, 20].includes(discountPercent)) {
    return { ok: false, message: "Desconto inválido." };
  }

  const supabase = await createSupabaseServerClient();
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  const oldPriceCents = applyDiscount(priceCents, discountPercent);

  const { data: insertedProduct, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id: categoryId,
      description,
      composition: composition || null,
      price_cents: priceCents,
      old_price_cents: oldPriceCents,
      is_visible: true,
      is_hot: false,
      show_in_new_arrivals_manual: false,
    })
    .select("id")
    .single();

  if (productError || !insertedProduct) {
    return { ok: false, message: `Erro ao criar produto: ${productError?.message}` };
  }

  const { data: colorData } = await supabase
    .from("colors")
    .select("slug")
    .eq("id", colorId)
    .maybeSingle();

  const { data: sizesData } = await supabase
    .from("sizes")
    .select("id,slug")
    .in("id", sizeIds);

  const colorSlug = colorData?.slug || "color";
  const sizesMap = new Map((sizesData ?? []).map((size) => [size.id, size.slug] as const));

  const variantsToInsert = sizeIds
    .map((sizeId) => {
      const sizeSlug = sizesMap.get(sizeId);
      if (!sizeSlug) return null;
      return {
        product_id: insertedProduct.id,
        color_id: colorId,
        size_id: sizeId,
        sku: `MLR-${skuPart(name, 8)}-${skuPart(colorSlug, 4)}-${skuPart(sizeSlug, 4)}-${insertedProduct.id.slice(0, 4)}`,
        price_cents: null,
        stock_quantity: 0,
        is_available: true,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (variantsToInsert.length > 0) {
    const { error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsToInsert);

    if (variantsError) {
      return { ok: false, message: `Erro ao criar variantes: ${variantsError.message}` };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { ok: true, message: "Produto criado com sucesso." };
}

export async function updateProductAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const composition = String(formData.get("composition") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const priceCents = toCents(String(formData.get("price") || ""));
  const discountPercent = Number(formData.get("discountPercent") || 0);
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);

  if (!productId || !name || !description || !categoryId || !priceCents) {
    const message = "Dados obrigatórios faltando para atualizar.";
    redirectWithNotice(redirectTo, false, message);
  }

  if (![0, 5, 10, 15, 20].includes(discountPercent)) {
    const message = "Desconto inválido.";
    redirectWithNotice(redirectTo, false, message);
  }

  const oldPriceCents = applyDiscount(priceCents, discountPercent);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      composition: composition || null,
      category_id: categoryId,
      price_cents: priceCents,
      old_price_cents: oldPriceCents,
    })
    .eq("id", productId);

  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao atualizar produto: ${error.message}`);
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  redirectWithNotice(redirectTo, true, "Produto atualizado.");
}

export async function addVariantAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const colorId = String(
    formData.get("colorId") || formData.get("colorIdDesktop") || "",
  ).trim();
  const sizeIds = formData
    .getAll("sizeIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const stockQuantityRaw = String(formData.get("stockQuantity") || "").trim();
  const stockQuantity = stockQuantityRaw ? Number(stockQuantityRaw) : 0;
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);

  if (
    !productId ||
    !colorId ||
    sizeIds.length === 0 ||
    !Number.isFinite(stockQuantity) ||
    stockQuantity < 0
  ) {
    redirectWithNotice(redirectTo, false, "Dados inválidos para variante.");
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: product }, { data: color }, { data: sizes }] = await Promise.all([
    supabase.from("products").select("name").eq("id", productId).maybeSingle(),
    supabase.from("colors").select("slug").eq("id", colorId).maybeSingle(),
    supabase.from("sizes").select("id,slug").in("id", sizeIds),
  ]);

  if (!product || !color || !sizes || sizes.length === 0) {
    redirectWithNotice(redirectTo, false, "Produto/cor/tamanho não encontrados.");
  }

  const sizeMap = new Map(sizes.map((size) => [size.id, size.slug] as const));
  const { data: existingVariants } = await supabase
    .from("product_variants")
    .select("size_id")
    .eq("product_id", productId)
    .eq("color_id", colorId);
  const existingSizeIds = new Set((existingVariants ?? []).map((row) => row.size_id));

  const variantsToInsert = sizeIds
    .filter((sizeId) => !existingSizeIds.has(sizeId))
    .map((sizeId) => {
      const sizeSlug = sizeMap.get(sizeId) || "size";
      return {
        product_id: productId,
        color_id: colorId,
        size_id: sizeId,
        sku: `MLR-${skuPart(product.name, 8)}-${skuPart(color.slug, 4)}-${skuPart(sizeSlug, 4)}-${productId.slice(0, 4)}`,
        stock_quantity: stockQuantity,
        is_available: true,
      };
    });

  if (variantsToInsert.length > 0) {
    const { error } = await supabase.from("product_variants").insert(variantsToInsert);
    if (error) {
      redirectWithNotice(redirectTo, false, `Erro ao adicionar variante: ${error.message}`);
    }
  }

  revalidatePath(`/admin/produtos/${productId}`);
  if (variantsToInsert.length === 0) {
    redirectWithNotice(redirectTo, true, "Nenhum novo tamanho foi inserido.");
  }
  redirectWithNotice(redirectTo, true, "Variante adicionada.");
}

export async function createColorAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const hexCodeRaw = String(formData.get("hexCode") || "").trim();
  const hexCode = hexCodeRaw.startsWith("#") ? hexCodeRaw.toUpperCase() : `#${hexCodeRaw.toUpperCase()}`;
  const redirectTo = getRedirectTarget(formData, "/admin/produtos");

  if (!name || !/^#[0-9A-F]{6}$/.test(hexCode)) {
    redirectWithNotice(redirectTo, false, "Informe nome e uma cor válida.");
  }

  const slugBase = slugify(name);
  if (!slugBase) {
    redirectWithNotice(redirectTo, false, "Nome da cor inválido.");
  }

  const supabase = await createSupabaseServerClient();
  let slug = slugBase;
  let counter = 1;
  while (true) {
    const { data: existing } = await supabase.from("colors").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    counter += 1;
    slug = `${slugBase}-${counter}`;
  }

  const { error } = await supabase.from("colors").insert({
    name,
    slug,
    hex_code: hexCode,
    is_active: true,
  });

  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao criar cor: ${error.message}`);
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/[id]", "page");
  redirectWithNotice(redirectTo, true, "Cor criada com sucesso.");
}

export async function updateVariantStockAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const variantId = String(formData.get("variantId") || "").trim();
  const stockQuantity = Number(String(formData.get("stockQuantity") || "0"));
  const isAvailable = formData.get("isAvailable") === "on";
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);

  if (!productId || !variantId || !Number.isFinite(stockQuantity) || stockQuantity < 0) {
    redirectWithNotice(redirectTo, false, "Dados inválidos para estoque.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_variants")
    .update({
      stock_quantity: stockQuantity,
      is_available: isAvailable,
    })
    .eq("id", variantId);

  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao atualizar estoque: ${error.message}`);
  }

  revalidatePath(`/admin/produtos/${productId}`);
  redirectWithNotice(redirectTo, true, "Estoque atualizado.");
}

export async function deleteVariantAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const variantId = String(formData.get("variantId") || "").trim();
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);
  if (!productId || !variantId) {
    redirectWithNotice(redirectTo, false, "Variante inválida para remoção.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: variant } = await supabase
    .from("product_variants")
    .select("id,color_id")
    .eq("id", variantId)
    .eq("product_id", productId)
    .maybeSingle();

  if (!variant) {
    redirectWithNotice(redirectTo, false, "Variante não encontrada.");
  }

  const { count: colorVariantsCount, error: countError } = await supabase
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("color_id", variant.color_id);

  if (countError) {
    redirectWithNotice(redirectTo, false, "Erro ao validar remoção da variante.");
  }

  if ((colorVariantsCount ?? 0) <= 1) {
    redirectWithNotice(redirectTo, false, "Não é permitido remover a última variante desta cor.");
  }

  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao remover variante: ${error.message}`);
  }
  revalidatePath(`/admin/produtos/${productId}`);
  redirectWithNotice(redirectTo, true, "Variante removida.");
}

export async function toggleProductVisibilityAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const nextVisible = String(formData.get("nextVisible") || "false") === "true";

  if (!productId) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("products").update({ is_visible: nextVisible }).eq("id", productId);

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
}

export async function deleteProductAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  if (!productId) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("products").delete().eq("id", productId);

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
}

export async function uploadProductImagesAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const colorIdRaw = String(formData.get("colorId") || "").trim();
  const colorId = colorIdRaw || null;
  const files = formData.getAll("images").filter((entry) => entry instanceof File);
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);

  if (!productId || files.length === 0) {
    redirectWithNotice(redirectTo, false, "Produto e fotos são obrigatórios.");
  }

  const supabase = await createSupabaseServerClient();
  const bucket = getSupabaseProductsBucket();

  let countQuery = supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  countQuery = colorId ? countQuery.eq("color_id", colorId) : countQuery.is("color_id", null);
  const { count, error: countError } = await countQuery;

  if (countError) {
    redirectWithNotice(redirectTo, false, "Erro ao validar limite de fotos.");
  }

  const existingCount = count ?? 0;
  if (existingCount + files.length > MAX_IMAGES_PER_PRODUCT) {
    redirectWithNotice(
      redirectTo,
      false,
      `Cada produto pode ter no máximo ${MAX_IMAGES_PER_PRODUCT} fotos.`,
    );
  }

  const rowsToInsert: Array<{
    product_id: string;
    color_id: string | null;
    image_url: string;
    storage_path: string;
    sort_order: number;
    is_primary: boolean;
  }> = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index] as File;
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      redirectWithNotice(redirectTo, false, `Erro no upload: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

    rowsToInsert.push({
      product_id: productId,
      color_id: colorId,
      image_url: publicUrlData.publicUrl,
      storage_path: path,
      sort_order: existingCount + index,
      is_primary: existingCount === 0 && index === 0,
    });
  }

  const { error: insertError } = await supabase
    .from("product_images")
    .insert(rowsToInsert);

  if (insertError) {
    redirectWithNotice(redirectTo, false, `Erro ao salvar fotos: ${insertError.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/[id]", "page");
  redirectWithNotice(redirectTo, true, "Fotos atualizadas com sucesso.");
}

export async function setPrimaryProductImageAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const imageId = String(formData.get("imageId") || "").trim();
  const colorIdRaw = String(formData.get("colorId") || "").trim();
  const colorId = colorIdRaw || null;
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);

  if (!productId || !imageId) {
    redirectWithNotice(redirectTo, false, "Imagem inválida para definir principal.");
  }

  const supabase = await createSupabaseServerClient();
  let scopeQuery = supabase.from("product_images").select("id").eq("product_id", productId);
  scopeQuery = colorId ? scopeQuery.eq("color_id", colorId) : scopeQuery.is("color_id", null);
  const { data: scopedImages } = await scopeQuery;
  if (!scopedImages || scopedImages.length === 0) {
    redirectWithNotice(redirectTo, false, "Não há imagens nessa cor para definir principal.");
  }

  const { error: clearPrimaryError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .in(
      "id",
      scopedImages.map((item) => item.id),
    );
  if (clearPrimaryError) {
    redirectWithNotice(
      redirectTo,
      false,
      `Erro ao limpar imagem principal atual: ${clearPrimaryError.message}`,
    );
  }

  const { error: setPrimaryError } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);
  if (setPrimaryError) {
    redirectWithNotice(redirectTo, false, `Erro ao definir imagem principal: ${setPrimaryError.message}`);
  }

  revalidatePath("/admin/produtos/[id]", "page");
  revalidatePath("/produtos");
  redirectWithNotice(redirectTo, true, "Imagem principal atualizada.");
}

export async function updateProductImageSortOrderAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const imageId = String(formData.get("imageId") || "").trim();
  const sortOrder = Number(String(formData.get("sortOrder") || "0"));
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);

  if (!productId || !imageId || !Number.isFinite(sortOrder) || sortOrder < 0) {
    redirectWithNotice(redirectTo, false, "Ordem de imagem inválida.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_images")
    .update({ sort_order: sortOrder })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao atualizar ordem da imagem: ${error.message}`);
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/produtos");
  redirectWithNotice(redirectTo, true, "Ordem da imagem atualizada.");
}

export async function deleteProductImageAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const imageId = String(formData.get("imageId") || "").trim();
  const redirectTo = getRedirectTarget(formData, `/admin/produtos/${productId}`);
  if (!productId || !imageId) {
    redirectWithNotice(redirectTo, false, "Imagem inválida para remoção.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path,color_id")
    .eq("id", imageId)
    .eq("product_id", productId)
    .maybeSingle();

  if (!image) {
    redirectWithNotice(redirectTo, false, "Imagem não encontrada.");
  }

  let countQuery = supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  countQuery = image.color_id ? countQuery.eq("color_id", image.color_id) : countQuery.is("color_id", null);
  const { count: scopedImageCount, error: scopedCountError } = await countQuery;

  if (scopedCountError) {
    redirectWithNotice(redirectTo, false, "Erro ao validar remoção da imagem.");
  }

  if ((scopedImageCount ?? 0) <= 1) {
    redirectWithNotice(redirectTo, false, "Não é permitido remover a última imagem desta cor.");
  }

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao remover imagem: ${error.message}`);
  }

  const bucket = getSupabaseProductsBucket();
  const { error: storageError } = await supabase.storage.from(bucket).remove([image.storage_path]);

  revalidatePath("/admin/produtos/[id]", "page");
  revalidatePath("/produtos");
  if (storageError) {
    redirectWithNotice(
      redirectTo,
      true,
      "Imagem removida do produto, mas houve falha ao remover o arquivo no storage.",
    );
  }
  redirectWithNotice(redirectTo, true, "Imagem removida.");
}

export async function updateProductHighlightsAction(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const isHot = formData.get("isHot") === "on";
  const showInNewArrivalsManual = formData.get("showInNewArrivalsManual") === "on";

  if (!productId) {
    return { ok: false, message: "Produto inválido." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      is_hot: isHot,
      show_in_new_arrivals_manual: showInNewArrivalsManual,
    })
    .eq("id", productId);

  if (error) {
    return { ok: false, message: `Erro ao atualizar destaque: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
  return { ok: true, message: "Destaques atualizados." };
}

export async function updateStockFromStockPageAction(formData: FormData) {
  const variantId = String(formData.get("variantId") || "").trim();
  const stockQuantity = Number(String(formData.get("stockQuantity") || "0"));
  const isAvailable = formData.get("isAvailable") === "on";
  const redirectTo = getRedirectTarget(formData, "/admin/estoque");

  if (!variantId || !Number.isFinite(stockQuantity) || stockQuantity < 0) {
    redirectWithNotice(redirectTo, false, "Dados inválidos para atualização de estoque.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_variants")
    .update({
      stock_quantity: stockQuantity,
      is_available: isAvailable,
    })
    .eq("id", variantId);

  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao atualizar estoque: ${error.message}`);
  }

  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
  redirectWithNotice(redirectTo, true, "Estoque atualizado.");
}
