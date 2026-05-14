import { updateStockFromStockPageAction } from "@/app/admin/estoque/actions";
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

function sanitizeSearchInput(raw?: string) {
  return (raw ?? "")
    .trim()
    .slice(0, 80)
    .replace(/[",.:()\\]/g, " ");
}

function escapeIlikePattern(raw: string) {
  return raw.replace(/[%_]/g, " ");
}

function toUuidInFilter(column: string, ids: string[]) {
  const sanitized = ids
    .map((id) => id.replace(/[^0-9a-f-]/gi, ""))
    .filter(Boolean);

  if (sanitized.length === 0) return null;
  return `${column}.in.(${sanitized.join(",")})`;
}

function toCounterNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }

  return 0;
}

function buildPageWindow(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  if (start <= 2) {
    return [1, 2, 3, 4, 5, 0, totalPages];
  }

  if (end >= totalPages - 1) {
    return [1, 0, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 0, ...Array.from({ length: end - start + 1 }, (_, idx) => start + idx), 0, totalPages];
}

export default async function AdminStockPage({ searchParams }: AdminStockPageProps) {
  const params = await searchParams;
  const rawSearch = String(params.q ?? "").trim();
  const searchQuery = sanitizeSearchInput(rawSearch);
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

  const pattern = searchQuery ? `%${escapeIlikePattern(searchQuery)}%` : "";
  let searchProductIds: string[] = [];
  let searchColorIds: string[] = [];
  let searchSizeIds: string[] = [];

  if (pattern) {
    const [{ data: productData }, { data: colorData }, { data: sizeData }] = await Promise.all([
      supabase.from("products").select("id").ilike("name", pattern).limit(80),
      supabase.from("colors").select("id").ilike("name", pattern).limit(80),
      supabase.from("sizes").select("id").ilike("name", pattern).limit(80),
    ]);

    searchProductIds = (productData ?? []).map((row) => String(row.id));
    searchColorIds = (colorData ?? []).map((row) => String(row.id));
    searchSizeIds = (sizeData ?? []).map((row) => String(row.id));
  }

  const orFilters: string[] = [];
  if (pattern) {
    orFilters.push(`sku.ilike.${pattern}`);
    const productFilter = toUuidInFilter("product_id", searchProductIds);
    const colorFilter = toUuidInFilter("color_id", searchColorIds);
    const sizeFilter = toUuidInFilter("size_id", searchSizeIds);
    if (productFilter) orFilters.push(productFilter);
    if (colorFilter) orFilters.push(colorFilter);
    if (sizeFilter) orFilters.push(sizeFilter);
  }

  const buildVariantListQuery = () => {
    let query = supabase
      .from("product_variants")
      .select("id,product_id,sku,stock_quantity,is_available,products(name),colors(name),sizes(name)")
      .order("stock_quantity", { ascending: true })
      .order("sku", { ascending: true });

    if (onlyZero) {
      query = query.eq("stock_quantity", 0);
    }

    if (onlyLow) {
      query = query.gt("stock_quantity", 0).lte("stock_quantity", 3);
    }

    if (onlyInactive) {
      query = query.eq("is_available", false);
    }

    if (orFilters.length > 0) {
      query = query.or(orFilters.join(","));
    }

    return query;
  };

  const buildVariantCountQuery = () => {
    let query = supabase.from("product_variants").select("id", { count: "exact", head: true });

    if (onlyZero) {
      query = query.eq("stock_quantity", 0);
    }

    if (onlyLow) {
      query = query.gt("stock_quantity", 0).lte("stock_quantity", 3);
    }

    if (onlyInactive) {
      query = query.eq("is_available", false);
    }

    if (orFilters.length > 0) {
      query = query.or(orFilters.join(","));
    }

    return query;
  };

  const [{ data, error }, { count: movementsCount }, { data: rpcCountersData, error: rpcCountersError }] =
    await Promise.all([
      buildVariantListQuery().range((page - 1) * pageSize, page * pageSize - 1),
      supabase.from("inventory_movements").select("id", { count: "exact", head: true }),
      supabase.rpc("admin_stock_counters", {
        p_search: searchQuery || null,
        p_only_low: onlyLow,
        p_only_zero: onlyZero,
        p_only_inactive: onlyInactive,
      }),
    ]);

  if (error) {
    throw error;
  }

  let totalItems = 0;
  let zeroCount = 0;
  let lowCount = 0;

  if (!rpcCountersError && Array.isArray(rpcCountersData) && rpcCountersData.length > 0) {
    const countersRow = rpcCountersData[0] as Record<string, unknown>;
    totalItems = toCounterNumber(countersRow.total);
    zeroCount = toCounterNumber(countersRow.zero_count);
    lowCount = toCounterNumber(countersRow.low_count);
  } else {
    const [totalResult, zeroResult, lowResult] = await Promise.all([
      buildVariantCountQuery(),
      buildVariantCountQuery().eq("stock_quantity", 0),
      buildVariantCountQuery().gt("stock_quantity", 0).lte("stock_quantity", 3),
    ]);

    if (totalResult.error) throw totalResult.error;
    if (zeroResult.error) throw zeroResult.error;
    if (lowResult.error) throw lowResult.error;

    totalItems = totalResult.count ?? 0;
    zeroCount = zeroResult.count ?? 0;
    lowCount = lowResult.count ?? 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  let rows = (data ?? []) as AdminStockRow[];

  if (safePage !== page && totalItems > 0) {
    const { data: safeData, error: safeError } = await buildVariantListQuery().range(
      (safePage - 1) * pageSize,
      safePage * pageSize - 1,
    );

    if (safeError) {
      throw safeError;
    }

    rows = (safeData ?? []) as AdminStockRow[];
  }

  const baseQuery = new URLSearchParams({
    ...(rawSearch ? { q: rawSearch } : {}),
    ...(onlyLow ? { onlyLow: "1" } : {}),
    ...(onlyZero ? { onlyZero: "1" } : {}),
    ...(onlyInactive ? { onlyInactive: "1" } : {}),
  });
  const currentPath = `/admin/estoque${
    baseQuery.toString()
      ? `?${new URLSearchParams({
          ...Object.fromEntries(baseQuery.entries()),
          page: String(safePage),
        }).toString()}`
      : `?page=${safePage}`
  }`;

  const buildPageHref = (nextPage: number) => {
    const query = new URLSearchParams(baseQuery.toString());
    if (nextPage > 1) query.set("page", String(nextPage));
    else query.delete("page");
    const qs = query.toString();
    return `/admin/estoque${qs ? `?${qs}` : ""}`;
  };
  const pageWindow = buildPageWindow(safePage, totalPages);

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
          <p className="text-lg font-bold leading-tight">{totalItems}</p>
        </div>
        <div className="border border-red-200 bg-red-50 px-2 py-2 text-sm">
          <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-red-700">
            Sem saldo
          </p>
          <p className="text-lg font-bold leading-tight text-red-700">{zeroCount ?? 0}</p>
        </div>
        <div className="border border-amber-200 bg-amber-50 px-2 py-2 text-sm">
          <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-amber-700">
            Baixo (1-3)
          </p>
          <p className="text-lg font-bold leading-tight text-amber-700">{lowCount ?? 0}</p>
        </div>
      </div>

      <form className="border border-black/10 bg-white p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className="h-10 border px-3 text-sm rounded-none"
            defaultValue={rawSearch}
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

      {rows.length === 0 ? (
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
            rows={rows}
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
              {pageWindow.map((pageNumber, index) =>
                pageNumber === 0 ? (
                  <span className="text-sm text-muted-foreground" key={`ellipsis-${index}`}>
                    ...
                  </span>
                ) : pageNumber === safePage ? (
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
