import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { ProductActionsMenu } from "@/components/admin/product-actions-menu";
import {
  getAdminCategories,
  getAdminColors,
  getAdminProductsByCategory,
  getAdminSizes,
} from "@/lib/admin/catalog-admin";
import {
  createProductAction,
  deleteProductAction,
  toggleProductVisibilityAction,
  updateProductHighlightsAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

type AdminProductsPageProps = {
  searchParams: Promise<{ category?: string; q?: string; hidden?: string }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const selectedCategoryId = params.category;
  const searchQuery = (params.q ?? "").trim();
  const showHiddenOnly = params.hidden === "1";

  const [categories, products, colors, sizes] = await Promise.all([
    getAdminCategories(),
    getAdminProductsByCategory(selectedCategoryId, searchQuery, showHiddenOnly),
    getAdminColors(),
    getAdminSizes(),
  ]);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold">Produtos</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre, edite status, destaque e imagens dos produtos.
        </p>
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
        {products.map((product) => (
          <article key={product.id} className="border border-black/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold">{product.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {categories.find((category) => category.id === product.categoryId)?.displayName ??
                    product.categoryName}{" "}
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
              />
            </div>

            <div className="mt-4">
              <form
                action={async (formData) => {
                  "use server";
                  await updateProductHighlightsAction(formData);
                }}
                className="space-y-2"
              >
                <input type="hidden" name="productId" value={product.id} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isHot"
                    defaultChecked={product.isHot}
                    className="h-4 w-4 border rounded-none"
                  />
                  Marcar como hot
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="showInNewArrivalsManual"
                    defaultChecked={product.showInNewArrivalsManual}
                    className="h-4 w-4 border rounded-none"
                  />
                  Incluir em novidades selecionadas
                </label>
                <ConfirmSubmitButton
                  className="rounded-none"
                  confirmMessage="Salvar alterações de destaque deste produto?"
                  size="sm"
                  variant="outline"
                >
                  Salvar destaque
                </ConfirmSubmitButton>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
