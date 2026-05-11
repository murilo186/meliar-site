import { redirect } from "next/navigation";
import { ClearNoticeQuery } from "@/components/admin/clear-notice-query";
import { formatCurrency } from "@/lib/format";
import { ProductActionsMenu } from "@/components/admin/product-actions-menu";
import { ProductHighlightsForm } from "@/components/admin/product-highlights-form";
import {
  getAdminCategories,
  getAdminColors,
  getAdminHighlightCounts,
  getAdminProductsByCategory,
  getAdminSizes,
} from "@/lib/admin/catalog-admin";
import {
  createProductAction,
  deleteProductAction,
  toggleProductVisibilityAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

type AdminProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    hidden?: string;
    status?: string;
    message?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const selectedCategoryId = params.category;
  const searchQuery = (params.q ?? "").trim();
  const showHiddenOnly = params.hidden === "1";
  const noticeStatus =
    params.status === "error" ? "error" : params.status === "success" ? "success" : null;
  const noticeMessage = params.message ?? "";

  const query = new URLSearchParams();
  if (selectedCategoryId) query.set("category", selectedCategoryId);
  if (searchQuery) query.set("q", searchQuery);
  if (showHiddenOnly) query.set("hidden", "1");
  const currentPath = `/admin/produtos${query.toString() ? `?${query.toString()}` : ""}`;

  const [categories, products, colors, sizes, highlightCounts] = await Promise.all([
    getAdminCategories(),
    getAdminProductsByCategory(selectedCategoryId, searchQuery, showHiddenOnly),
    getAdminColors(),
    getAdminSizes(),
    getAdminHighlightCounts(),
  ]);
  const categoriesById = new Map(categories.map((category) => [category.id, category.displayName]));

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

      <header>
        <h2 className="text-xl font-bold">Produtos</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre, edite status, destaque e imagens dos produtos.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
          <span
            className={`border px-2 py-1 ${
              highlightCounts.hot > highlightCounts.max
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-black/15 bg-black/[0.03] text-melier-ink"
            }`}
          >
            Hot: {highlightCounts.hot} de {highlightCounts.max}
          </span>
          <span
            className={`border px-2 py-1 ${
              highlightCounts.newArrivals > highlightCounts.max
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-black/15 bg-black/[0.03] text-melier-ink"
            }`}
          >
            Novidades: {highlightCounts.newArrivals} de {highlightCounts.max}
          </span>
        </div>
      </header>

      <article className="border border-black/10 bg-white">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold uppercase tracking-[0.12em] text-melier-ink [&::-webkit-details-marker]:hidden">
            <span>Novo produto</span>
            <span className="text-base leading-none group-open:hidden">+</span>
            <span className="hidden text-base leading-none group-open:inline">-</span>
          </summary>

          <form
            action={async (formData) => {
              "use server";
              await createProductAction(formData);
            }}
            className="grid gap-3 p-4 pt-0"
          >
          <input type="hidden" name="redirectTo" value={currentPath} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Nome</span>
              <input
                name="name"
                required
                className="h-10 border px-3 rounded-none"
                placeholder="Nome do produto"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Preço (R$)</span>
              <input
                name="price"
                required
                className="h-10 border px-3 rounded-none"
                placeholder="149,90"
                inputMode="decimal"
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Descrição</span>
            <textarea
              name="description"
              required
              className="min-h-24 border px-3 py-2 rounded-none"
              placeholder="Descrição curta e comercial"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Composição (opcional)</span>
            <input
              name="composition"
              className="h-10 border px-3 rounded-none"
              placeholder="Ex: Viscose com elastano"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Subcategoria</span>
              <select name="categoryId" required className="h-10 border px-3 rounded-none">
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.displayName}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Cor principal</span>
              <select
                name="colorId"
                size={6}
                className="border px-3 py-2 rounded-none md:hidden"
              >
                <option value="">Selecione</option>
                {colors.map((color) => (
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
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold">Tamanhos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <label
                  key={size.id}
                  className="flex items-center gap-2 border px-2 py-1 text-sm rounded-none"
                >
                  <input type="checkbox" name="sizeIds" value={size.id} />
                  {size.name}
                </label>
              ))}
            </div>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Desconto</span>
            <select
              name="discountPercent"
              defaultValue="0"
              className="h-10 border px-3 rounded-none"
            >
              <option value="0">Sem desconto</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
            </select>
          </label>

            <div>
              <Button type="submit" size="sm" className="rounded-none">
                Criar produto
              </Button>
            </div>
          </form>
        </details>
      </article>

      <form
        action={async (formData) => {
          "use server";
          const category = String(formData.get("category") || "");
          const q = String(formData.get("q") || "").trim();
          const hidden = String(formData.get("hidden") || "") === "1";
          const query = new URLSearchParams();
          if (category) query.set("category", category);
          if (q) query.set("q", q);
          if (hidden) query.set("hidden", "1");
          const qs = query.toString();
          redirect(qs ? `/admin/produtos?${qs}` : "/admin/produtos");
        }}
        className="border border-black/10 bg-white p-4"
      >
        <div className="grid gap-2">
          <label className="text-sm font-semibold" htmlFor="q">
            Buscar produto
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchQuery}
            placeholder="Ex: vestido"
            className="h-10 border px-3 text-sm rounded-none"
          />
        </div>
        <div className="mt-3 grid gap-2">
          <label className="text-sm font-semibold" htmlFor="category">
            Filtrar por subcategoria
          </label>
          <select
            id="category"
            name="category"
            defaultValue={selectedCategoryId ?? ""}
            className="h-10 min-w-56 border px-3 text-sm rounded-none"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.displayName}
              </option>
            ))}
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hidden"
            value="1"
            defaultChecked={showHiddenOnly}
            className="h-4 w-4 border rounded-none"
          />
          Mostrar apenas ocultos
        </label>
        <div className="mt-3 flex gap-2">
          <Button type="submit" size="sm" className="rounded-none">
            Aplicar
          </Button>
          <Button asChild type="button" size="sm" variant="outline" className="rounded-none">
            <a href="/admin/produtos">Limpar</a>
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {products.map((product) => {
          return (
            <article key={product.id} className="border border-black/10 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold">{product.name}</h3>
                    {product.isHot ? (
                      <span className="rounded-full bg-[#ffe4ec] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-melier-rose">
                        Hot
                      </span>
                    ) : null}
                    {product.showInNewArrivalsManual ? (
                      <span className="rounded-full bg-[#ffe4ec] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-melier-rose">
                        Novo
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {categoriesById.get(product.categoryId) ?? product.categoryName}{" "}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatCurrency(product.priceCents / 100)}{" "}
                    {product.oldPriceCents ? (
                      <span className="ml-2 text-xs text-muted-foreground line-through">
                        {formatCurrency(product.oldPriceCents / 100)}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs">
                    Status no site:{" "}
                    <span className={product.isVisible ? "text-emerald-700" : "text-amber-700"}>
                      {product.isVisible ? "ativo" : "oculto"}
                    </span>
                  </p>
                  {product.imagesCount === 0 ? (
                    <p className="mt-1 text-xs font-semibold text-red-700">Anúncio sem imagem</p>
                  ) : null}
                  {product.hasVariantWithoutImage ? (
                    <p className="mt-1 text-xs font-semibold text-red-700">Variante sem imagem</p>
                  ) : null}
                </div>

                <ProductActionsMenu
                  isVisible={product.isVisible}
                  onDelete={deleteProductAction}
                  onToggleVisibility={toggleProductVisibilityAction}
                  productId={product.id}
                  redirectTo={currentPath}
                />
              </div>

              <div className="mt-4">
                <ProductHighlightsForm
                  productId={product.id}
                  isHot={product.isHot}
                  showInNewArrivalsManual={product.showInNewArrivalsManual}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
