import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Trash2, X } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminCategories } from "@/lib/admin/catalog-admin";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { ClearNoticeQuery } from "@/components/admin/clear-notice-query";
import { Button } from "@/components/ui/button";
import {
  addVariantAction,
  createColorAction,
  deleteProductImageAction,
  deleteVariantAction,
  setPrimaryProductImageAction,
  updateProductAction,
  updateProductImageSortOrderAction,
  updateVariantStockAction,
  uploadProductImagesAction,
} from "@/app/admin/actions";

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const categories = await getAdminCategories();
  const currentPath = `/admin/produtos/${id}`;
  const noticeStatus = query.status === "error" ? "error" : query.status === "success" ? "success" : null;
  const noticeMessage = query.message ?? "";

  const [
    { data: product },
    { data: colors },
    { data: sizes },
    { data: variants },
  ] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,name,slug,description,composition,price_cents,old_price_cents,is_visible,category_id")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("colors").select("id,name,slug").eq("is_active", true).order("name"),
      supabase.from("sizes").select("id,name,slug,sort_order").eq("is_active", true).order("sort_order"),
      supabase
        .from("product_variants")
        .select("id,sku,stock_quantity,is_available,color_id,size_id,colors(name,hex_code),sizes(name)")
        .eq("product_id", id)
        .order("created_at", { ascending: true }),
    ]);

  const { data: imagesWithPrimary, error: imagesWithPrimaryError } = await supabase
    .from("product_images")
    .select("id,color_id,image_url,sort_order,is_primary")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  const images =
    imagesWithPrimaryError == null
      ? imagesWithPrimary
      : (
          await supabase
            .from("product_images")
            .select("id,color_id,image_url,sort_order")
            .eq("product_id", id)
            .order("sort_order", { ascending: true })
        ).data?.map((image) => ({ ...image, is_primary: false }));

  if (!product) {
    notFound();
  }

  const estimatedDiscount = product.old_price_cents
    ? Math.round((1 - product.price_cents / product.old_price_cents) * 100)
    : 0;

  const variantsList = variants ?? [];
  const imagesList = images ?? [];
  const variantsByColor = new Map<string, typeof variantsList>();
  for (const variant of variantsList) {
    const key = variant.color_id;
    const current = variantsByColor.get(key) ?? [];
    current.push(variant);
    variantsByColor.set(key, current);
  }

  return (
    <section className="space-y-4">
      {noticeStatus && noticeMessage ? (
        <>
          <ClearNoticeQuery />
          <div
            className={`border px-3 py-2 text-sm ${
              noticeStatus === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {noticeMessage}
          </div>
        </>
      ) : null}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Editar produto</h2>
          <p className="text-sm text-muted-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">Slug: {product.slug}</p>
          <Link
            className="text-xs text-melier-ink underline"
            href={`/produto/${product.slug}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Ver página pública
          </Link>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-none">
          <Link href="/admin/produtos">Voltar</Link>
        </Button>
      </header>

      <article className="border border-black/10 bg-white">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold uppercase tracking-[0.12em] text-melier-ink [&::-webkit-details-marker]:hidden">
            <span>Dados do produto</span>
            <span className="text-base leading-none group-open:hidden">&gt;</span>
            <span className="hidden text-base leading-none group-open:inline">v</span>
          </summary>

          <form
            action={async (formData) => {
              "use server";
              await updateProductAction(formData);
            }}
            className="grid gap-3 p-4 pt-0"
          >
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="redirectTo" value={currentPath} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Nome</span>
            <input
              name="name"
              required
              defaultValue={product.name}
              className="h-10 border px-3 rounded-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Preço (R$)</span>
            <input
              name="price"
              required
              defaultValue={(product.price_cents / 100).toFixed(2).replace(".", ",")}
              inputMode="decimal"
              pattern="^[0-9]+([,.][0-9]{1,2})?$"
              className="h-10 border px-3 rounded-none"
            />
          </label>
        </div>

          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Descrição</span>
            <textarea
              name="description"
              required
              defaultValue={product.description ?? ""}
              className="min-h-24 border px-3 py-2 rounded-none"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Composição</span>
            <input
              name="composition"
              defaultValue={product.composition ?? ""}
              className="h-10 border px-3 rounded-none"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Subcategoria</span>
              <select
                name="categoryId"
                required
                defaultValue={product.category_id}
                className="h-10 border px-3 rounded-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Desconto</span>
              <select
                name="discountPercent"
                defaultValue={[0, 5, 10, 15, 20].includes(estimatedDiscount) ? String(estimatedDiscount) : "0"}
                className="h-10 border px-3 rounded-none"
              >
                <option value="0">Sem desconto</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
              </select>
            </label>
          </div>

            <div>
              <ConfirmSubmitButton
                className="rounded-none"
                confirmMessage="Salvar alterações deste produto?"
                size="sm"
              >
                Salvar produto
              </ConfirmSubmitButton>
            </div>
          </form>
        </details>
      </article>

      <article className="border border-black/10 bg-white">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold uppercase tracking-[0.12em] text-melier-ink [&::-webkit-details-marker]:hidden">
            <span>Variantes</span>
            <span className="text-base leading-none group-open:hidden">&gt;</span>
            <span className="hidden text-base leading-none group-open:inline">v</span>
          </summary>

          <div className="p-4 pt-0">
            <div className="border border-black/10 p-3">
              <form
                action={async (formData) => {
                  "use server";
                  await createColorAction(formData);
                }}
                className="grid gap-2 sm:grid-cols-[1fr_130px_auto] sm:items-end"
              >
                <input type="hidden" name="redirectTo" value={currentPath} />
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold">Nova cor (nome)</span>
                  <input
                    name="name"
                    required
                    className="h-10 border px-3 rounded-none"
                    placeholder="Ex: Azul petróleo"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold">Tom</span>
                  <input
                    type="color"
                    name="hexCode"
                    defaultValue="#111111"
                    className="h-10 border px-2 rounded-none"
                  />
                </label>
                <Button size="sm" type="submit" className="rounded-none">
                  Criar cor
                </Button>
              </form>

              <form
                action={async (formData) => {
                  "use server";
                  await addVariantAction(formData);
                }}
                className="mt-3 grid gap-3"
              >
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="redirectTo" value={currentPath} />

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="grid gap-1 text-sm">
                    <span className="font-semibold">Cor</span>
                    <select
                      name="colorId"
                      size={6}
                      className="border px-3 py-2 rounded-none md:hidden"
                    >
                      <option value="">Selecione</option>
                      {(colors ?? []).map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="colorIdDesktop"
                      className="hidden h-10 border px-3 rounded-none md:block"
                    >
                      <option value="">Selecione</option>
                      {(colors ?? []).map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button size="sm" type="submit" className="rounded-none">
                    Adicionar variantes
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-semibold">Tamanhos</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(sizes ?? []).map((size) => (
                      <label key={size.id} className="flex items-center gap-2 px-2 py-2 text-sm">
                        <input type="checkbox" name="sizeIds" value={size.id} />
                        {size.name}
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="mt-4 space-y-2">
              {Array.from(variantsByColor.entries()).map(([colorId, colorVariants]) => {
            const firstVariant = colorVariants[0];
            const color = firstVariant
              ? Array.isArray(firstVariant.colors)
                ? firstVariant.colors[0]
                : firstVariant.colors
              : null;
            const colorImages = imagesList.filter((image) => image.color_id === colorId);
            const hasPrimary = colorImages.some((image) => image.is_primary);

            return (
              <div key={colorId} className="border border-black/10 p-3">
                <div className="mt-2 flex items-center gap-2">
                  {color?.hex_code ? (
                    <span
                      className="inline-block h-4 w-4 border border-black/20"
                      style={{ backgroundColor: color.hex_code }}
                    />
                  ) : null}
                  <span className="text-sm font-semibold">{color?.name ?? "Cor sem nome"}</span>
                </div>

                <form
                  action={async (formData) => {
                    "use server";
                    await uploadProductImagesAction(formData);
                  }}
                  className="mt-2 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="colorId" value={colorId} />
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <input type="file" name="images" accept="image/*" multiple className="text-xs" />
                  <Button size="sm" type="submit" variant="outline" className="rounded-none">
                    Upload
                  </Button>
                </form>

                {colorImages.length === 0 ? (
                  <p className="mt-2 text-xs font-semibold text-red-700">Sem imagens nesta cor.</p>
                ) : null}

                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {colorImages.map((image) => (
                    <div key={image.id} className="border border-black/10 p-2">
                      <div className="relative">
                        <img
                          src={image.image_url}
                          alt={`Imagem de ${color?.name ?? "variante"}`}
                          className="aspect-square w-full object-cover"
                        />
                        <form action={setPrimaryProductImageAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="imageId" value={image.id} />
                          <input type="hidden" name="colorId" value={colorId} />
                          <input type="hidden" name="redirectTo" value={currentPath} />
                          <button
                            aria-label={
                              image.is_primary || (!hasPrimary && image.sort_order === 0)
                                ? "Imagem principal"
                                : "Definir como principal"
                            }
                            className="absolute left-2 top-2 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                            type="submit"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                image.is_primary || (!hasPrimary && image.sort_order === 0)
                                  ? "fill-melier-rose text-melier-rose"
                                  : "fill-none text-melier-ink"
                              }`}
                            />
                          </button>
                        </form>
                        <form action={deleteProductImageAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="imageId" value={image.id} />
                          <input type="hidden" name="redirectTo" value={currentPath} />
                          <ConfirmSubmitButton
                            aria-label="Remover imagem"
                            className="absolute right-2 top-2 bg-white/95 p-2 text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                            confirmMessage="Tem certeza que deseja remover/deletar este item?"
                            size="icon"
                            variant="outline"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                      <form
                        action={async (formData) => {
                          "use server";
                          await updateProductImageSortOrderAction(formData);
                        }}
                        className="mt-2 flex items-end gap-2"
                      >
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <label className="grid gap-1 text-xs">
                          <span className="font-semibold">Ordem</span>
                          <input
                            type="number"
                            min={0}
                            name="sortOrder"
                            defaultValue={String(image.sort_order)}
                            className="h-8 w-20 border px-2 text-xs rounded-none"
                          />
                        </label>
                        <Button size="sm" type="submit" variant="outline" className="rounded-none">
                          Salvar
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2">
                  {colorVariants.length === 0 ? (
                    <p className="text-xs font-semibold text-red-700">Sem variantes nesta cor.</p>
                  ) : null}
                  {colorVariants.map((variant) => {
                    const size = Array.isArray(variant.sizes) ? variant.sizes[0] : variant.sizes;
                    return (
                      <div key={variant.id} className="p-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          SKU: <span className="font-mono text-[11px] text-black">{variant.sku}</span>
                        </p>
                        <p className="mt-1 text-sm">{size?.name ?? "-"}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <form
                            action={async (formData) => {
                              "use server";
                              await updateVariantStockAction(formData);
                            }}
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="variantId" value={variant.id} />
                            <input type="hidden" name="redirectTo" value={currentPath} />
                            <input
                              name="stockQuantity"
                              defaultValue={String(variant.stock_quantity)}
                              className="h-9 w-24 border px-2 text-sm rounded-none"
                            />
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                name="isAvailable"
                                defaultChecked={variant.is_available}
                              />
                              Ativa
                            </label>
                            <ConfirmSubmitButton
                              className="rounded-none"
                              confirmMessage="Salvar alterações de estoque desta variante?"
                              size="sm"
                              variant="outline"
                            >
                              Salvar
                            </ConfirmSubmitButton>
                          </form>

                          <form action={deleteVariantAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="variantId" value={variant.id} />
                            <input type="hidden" name="redirectTo" value={currentPath} />
                            <ConfirmSubmitButton
                              aria-label="Remover variante"
                              className="rounded-none px-2"
                              confirmMessage="Tem certeza que deseja remover/deletar este item?"
                              size="icon"
                              variant="outline"
                            >
                              <X className="h-4 w-4" />
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                  {(() => {
                    const existingSizeIds = new Set(colorVariants.map((variant) => variant.size_id));
                    const availableSizes = (sizes ?? []).filter((size) => !existingSizeIds.has(size.id));
                    if (availableSizes.length === 0) return null;
                    return (
                      <form
                        action={async (formData) => {
                          "use server";
                          await addVariantAction(formData);
                        }}
                        className="flex flex-wrap items-end gap-2 p-2"
                      >
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="colorId" value={colorId} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <label className="grid gap-1 text-xs">
                          <span className="font-semibold">Inserir outro tamanho</span>
                          <select name="sizeIds" className="h-9 border px-2 text-sm rounded-none">
                            {availableSizes.map((size) => (
                              <option key={size.id} value={size.id}>
                                {size.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <Button size="sm" type="submit" variant="outline" className="rounded-none">
                          Inserir tamanho
                        </Button>
                      </form>
                    );
                  })()}
                </div>
              </div>
            );
              })}
            </div>
            {variantsByColor.size === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma variante cadastrada para este produto.</p>
            ) : null}
          </div>
        </details>
      </article>
    </section>
  );
}
