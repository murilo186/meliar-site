import { updateStockFromStockPageAction } from "@/app/admin/actions";
import { ClearNoticeQuery } from "@/components/admin/clear-notice-query";
import { StockTable } from "@/components/admin/stock-table";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminStockRow } from "@/types/admin";

type AdminStockPageProps = {
  searchParams: Promise<{
    q?: string;
    onlyLow?: string;
    onlyZero?: string;
    onlyInactive?: string;
    page?: string;
    status?: string;
    message?: string;
  }>;
};

export default async function AdminStockPage({ searchParams }: AdminStockPageProps) {
  const params = await searchParams;
  const searchQuery = (params.q ?? "").trim().toLowerCase();
  const onlyLow = params.onlyLow === "1";
  const onlyZero = params.onlyZero === "1";
  const onlyInactive = params.onlyInactive === "1";
  const parsedPage = Number(params.page ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const pageSize = 12;

  const noticeStatus =
    params.status === "error" ? "error" : params.status === "success" ? "success" : null;
  const noticeMessage = params.message ?? "";

  const supabase = await createSupabaseServerClient();
  const variants: AdminStockRow[] = [];
  const batchSize = 1000;
  let offset = 0;
  let loadErrorMessage = "";

  try {
    while (true) {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id,product_id,sku,stock_quantity,is_available,products(name),colors(name),sizes(name)")
        .order("stock_quantity", { ascending: true })
        .order("sku", { ascending: true })
        .range(offset, offset + batchSize - 1);
      if (error) throw error;
      const batch = (data ?? []) as AdminStockRow[];
      variants.push(...batch);
      if (batch.length < batchSize) break;
      offset += batchSize;
    }
  } catch (error) {
    loadErrorMessage =
      error instanceof Error ? error.message : "Falha ao carregar dados de estoque.";
  }

  const { count: movementsCount } = await supabase
    .from("inventory_movements")
    .select("id", { count: "exact", head: true });

  const allRows = variants;
  const filteredRows = allRows.filter((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const color = Array.isArray(row.colors) ? row.colors[0] : row.colors;
    const size = Array.isArray(row.sizes) ? row.sizes[0] : row.sizes;
    const haystack = `${product?.name ?? ""} ${color?.name ?? ""} ${size?.name ?? ""} ${row.sku}`.toLowerCase();
    if (searchQuery && !haystack.includes(searchQuery)) return false;
    if (onlyZero && row.stock_quantity !== 0) return false;
    if (onlyLow && (row.stock_quantity <= 0 || row.stock_quantity > 3)) return false;
    if (onlyInactive && row.is_available) return false;
    return true;
  });

  const zeroCount = filteredRows.filter((row) => row.stock_quantity === 0).length;
  const lowCount = filteredRows.filter((row) => row.stock_quantity > 0 && row.stock_quantity <= 3).length;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedRows = filteredRows.slice(start, start + pageSize);

  const baseQuery = new URLSearchParams({
    ...(searchQuery ? { q: searchQuery } : {}),
    ...(onlyLow ? { onlyLow: "1" } : {}),
    ...(onlyZero ? { onlyZero: "1" } : {}),
    ...(onlyInactive ? { onlyInactive: "1" } : {}),
  });
  const currentPath = `/admin/estoque${
    baseQuery.toString() ? `?${new URLSearchParams({ ...Object.fromEntries(baseQuery.entries()), page: String(safePage) }).toString()}` : `?page=${safePage}`
  }`;

  const buildPageHref = (nextPage: number) => {
    const query = new URLSearchParams(baseQuery.toString());
    if (nextPage > 1) query.set("page", String(nextPage));
    else query.delete("page");
    const qs = query.toString();
    return `/admin/estoque${qs ? `?${qs}` : ""}`;
  };

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
        <h2 className="text-xl font-bold">Estoque</h2>
        <p className="text-sm text-muted-foreground">
          Variantes cadastradas e saldo atual. Movimentos registrados: {movementsCount ?? 0}.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <div className="border border-black/10 bg-white px-2 py-2 text-sm">
          <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Variantes
          </p>
          <p className="text-lg font-bold leading-tight">{filteredRows.length}</p>
        </div>
        <div className="border border-red-200 bg-red-50 px-2 py-2 text-sm">
          <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-red-700">Sem saldo</p>
          <p className="text-lg font-bold leading-tight text-red-700">{zeroCount}</p>
        </div>
        <div className="border border-amber-200 bg-amber-50 px-2 py-2 text-sm">
          <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-amber-700">
            Baixo (1-3)
          </p>
          <p className="text-lg font-bold leading-tight text-amber-700">{lowCount}</p>
        </div>
      </div>

      <form className="border border-black/10 bg-white p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className="h-10 border px-3 text-sm rounded-none"
            defaultValue={searchQuery}
            name="q"
            placeholder="Buscar por produto, cor, tamanho ou SKU"
          />
          <Button className="rounded-none" size="sm" type="submit">
            Buscar
          </Button>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input className="h-4 w-4" defaultChecked={onlyLow} name="onlyLow" type="checkbox" value="1" />
          Mostrar apenas saldo baixo
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input className="h-4 w-4" defaultChecked={onlyZero} name="onlyZero" type="checkbox" value="1" />
          Mostrar apenas sem saldo
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input className="h-4 w-4" defaultChecked={onlyInactive} name="onlyInactive" type="checkbox" value="1" />
          Mostrar apenas variantes inativas
        </label>
      </form>

      {loadErrorMessage ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Não foi possível carregar o estoque agora. Detalhe: {loadErrorMessage}
        </div>
      ) : pagedRows.length === 0 ? (
        <div className="border border-black/10 bg-white p-4 text-sm text-muted-foreground">
          Nenhuma variante encontrada para os filtros atuais.
        </div>
      ) : (
        <>
          <StockTable
            currentPath={currentPath}
            onSubmit={async (formData) => {
              "use server";
              await updateStockFromStockPageAction(formData);
            }}
            rows={pagedRows}
          />
          <nav className="flex flex-wrap items-center justify-center gap-3 py-1">
            {safePage > 1 ? (
              <a className="rounded px-2 py-1 text-base font-semibold text-melier-ink hover:bg-[#ffe4ec]" href={buildPageHref(safePage - 1)}>
                {"<"}
              </a>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{"<"}</span>
            )}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) =>
                pageNumber === safePage ? (
                  <span className="text-sm font-bold text-melier-ink" key={pageNumber}>
                    {pageNumber}
                  </span>
                ) : (
                  <a
                    className="rounded px-2 py-1 text-base font-medium text-muted-foreground hover:bg-[#ffe4ec] hover:text-melier-ink"
                    href={buildPageHref(pageNumber)}
                    key={pageNumber}
                  >
                    {pageNumber}
                  </a>
                ),
              )}
            </div>
            {safePage < totalPages ? (
              <a className="rounded px-2 py-1 text-base font-semibold text-melier-ink hover:bg-[#ffe4ec]" href={buildPageHref(safePage + 1)}>
                {">"}
              </a>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{">"}</span>
            )}
          </nav>
        </>
      )}
    </section>
  );
}
