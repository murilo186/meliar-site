import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { AdminSalesCounters } from "@/lib/admin/sales-orders";
import type { AdminSalesOrderSummary, AdminSalesStatus } from "@/types/admin";

type SalesWorkbenchProps = {
  rows: AdminSalesOrderSummary[];
  counters: AdminSalesCounters;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  query: string;
  status: AdminSalesStatus | "all";
};

const statusLabel: Record<AdminSalesStatus, string> = {
  pending: "Novo",
  approved: "Em atendimento",
  paid: "Confirmado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusClass: Record<AdminSalesStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-black/5 text-black border-black/15",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function buildHref({
  page,
  query,
  status,
}: {
  page?: number;
  query: string;
  status: AdminSalesStatus | "all";
}) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `/admin/vendas?${search}` : "/admin/vendas";
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

export function SalesWorkbench({
  rows,
  counters,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  query,
  status,
}: SalesWorkbenchProps) {
  const pageWindow = buildPageWindow(currentPage, totalPages);
  const hasRows = rows.length > 0;

  const fromItem = hasRows ? (currentPage - 1) * pageSize + 1 : 0;
  const toItem = hasRows ? fromItem + rows.length - 1 : 0;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold">Vendas</h2>
        <p className="text-sm text-muted-foreground">
          Pedidos registrados no fluxo da loja e atendimento.
        </p>
      </header>

      <div className="border border-black/10 bg-white p-3">
        <ul className="grid gap-1 text-sm">
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Total:</span>
            <span className="font-bold">{counters.total}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Novos:</span>
            <span className="font-bold">{counters.pending}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Em atendimento:</span>
            <span className="font-bold">{counters.approved}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Confirmados:</span>
            <span className="font-bold">{counters.paid}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Entregues:</span>
            <span className="font-bold">{counters.delivered}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="font-semibold">Cancelados:</span>
            <span className="font-bold">{counters.cancelled}</span>
          </li>
        </ul>
      </div>

      <div className="border border-black/10 bg-white p-3">
        <form className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_220px_auto_auto]" method="get">
          <input
            className="h-10 w-full min-w-0 border px-3 text-sm rounded-none"
            defaultValue={query}
            name="q"
            placeholder="Buscar por #A1B2C3D4, cliente, telefone ou e-mail"
          />
          <select
            className="h-10 w-full min-w-0 border px-3 text-sm rounded-none"
            defaultValue={status}
            name="status"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Novo</option>
            <option value="approved">Em atendimento</option>
            <option value="paid">Confirmado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <Button className="w-full rounded-none sm:w-auto" type="submit" variant="outline">
            Filtrar
          </Button>
          <Button asChild className="w-full rounded-none sm:w-auto" type="button" variant="outline">
            <Link href="/admin/vendas">Limpar</Link>
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          {hasRows
            ? `Mostrando ${fromItem}-${toItem} de ${totalItems} pedidos`
            : "Nenhum pedido encontrado com os filtros atuais."}
        </p>
      </div>

      <div className="space-y-2 md:hidden">
        {rows.map((order) => (
          <article className="border border-black/10 bg-white p-3" key={order.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{order.orderNumber}</p>
              <p className="text-sm font-bold text-melier-ink">{formatCurrency(order.totalCents / 100)}</p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span
                className={`inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.04em] ${statusClass[order.status]}`}
              >
                {statusLabel[order.status]}
              </span>
              <p className="text-[11px] text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <p className="mt-2 text-sm">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <p className="text-muted-foreground">
                Canal: <span className="font-medium text-black">{order.channel === "whatsapp" ? "WhatsApp" : "Manual"}</span>
              </p>
              <p className="text-muted-foreground">
                Itens: <span className="font-medium text-black">{order.itemsCount}</span>
              </p>
            </div>
            <div className="mt-3">
              <Button asChild className="w-full rounded-none" size="sm" type="button" variant="outline">
                <Link href={`/admin/vendas/${order.id}`}>Detalhes</Link>
              </Button>
            </div>
          </article>
        ))}
        {!hasRows ? (
          <div className="border border-black/10 bg-white px-3 py-8 text-center text-sm text-muted-foreground">
            Nenhum pedido encontrado.
          </div>
        ) : null}
      </div>

      <div className="hidden w-full overflow-x-auto border border-black/10 bg-white md:block">
        <table className="min-w-[920px] text-sm">
          <thead className="bg-[#ffe4ec] text-left">
            <tr>
              <th className="px-3 py-2 font-semibold">Pedido</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Cliente</th>
              <th className="px-3 py-2 font-semibold">Telefone</th>
              <th className="px-3 py-2 font-semibold">Canal</th>
              <th className="px-3 py-2 font-semibold">Itens</th>
              <th className="px-3 py-2 font-semibold">Total</th>
              <th className="px-3 py-2 font-semibold">Data</th>
              <th className="px-3 py-2 font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr className="border-t border-black/10" key={order.id}>
                <td className="px-3 py-2 font-semibold">{order.orderNumber}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex border px-2 py-0.5 text-xs ${statusClass[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td className="px-3 py-2">{order.customerName}</td>
                <td className="px-3 py-2">{order.customerPhone}</td>
                <td className="px-3 py-2">{order.channel === "whatsapp" ? "WhatsApp" : "Manual"}</td>
                <td className="px-3 py-2">{order.itemsCount}</td>
                <td className="px-3 py-2 font-semibold">{formatCurrency(order.totalCents / 100)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-2">
                  <Button asChild className="rounded-none" size="sm" type="button" variant="outline">
                    <Link href={`/admin/vendas/${order.id}`}>Detalhes</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {!hasRows ? (
              <tr>
                <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={9}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground md:hidden">
        Lista compacta para mobile. No desktop, a visualização completa aparece em tabela.
      </p>

      <nav className="flex flex-wrap items-center justify-center gap-1 py-1">
        {currentPage > 1 ? (
          <Button asChild className="rounded-none px-2" size="sm" type="button" variant="ghost">
            <Link href={buildHref({ page: currentPage - 1, query, status })}>{"<"}</Link>
          </Button>
        ) : (
          <span className="px-2 text-sm font-semibold text-muted-foreground">{"<"}</span>
        )}

        <div className="flex items-center gap-1">
          {pageWindow.map((pageNumber, index) =>
            pageNumber === 0 ? (
              <span className="px-1 text-xs text-muted-foreground" key={`ellipsis-${index}`}>
                ...
              </span>
            ) : pageNumber === currentPage ? (
              <span className="px-2 text-sm font-bold text-melier-ink" key={pageNumber}>
                {pageNumber}
              </span>
            ) : (
              <Button
                asChild
                className="rounded-none px-2"
                key={pageNumber}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Link href={buildHref({ page: pageNumber, query, status })}>{pageNumber}</Link>
              </Button>
            ),
          )}
        </div>

        {currentPage < totalPages ? (
          <Button asChild className="rounded-none px-2" size="sm" type="button" variant="ghost">
            <Link href={buildHref({ page: currentPage + 1, query, status })}>{">"}</Link>
          </Button>
        ) : (
          <span className="px-2 text-sm font-semibold text-muted-foreground">{">"}</span>
        )}
      </nav>
    </section>
  );
}
