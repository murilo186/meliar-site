"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { AdminSalesOrderSummary, AdminSalesStatus } from "@/types/admin";

type SalesWorkbenchProps = {
  initialOrders: AdminSalesOrderSummary[];
};

const statusLabel: Record<AdminSalesStatus, string> = {
  open: "Aberto",
  paid: "Pago",
  in_delivery: "Em entrega",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

const statusClass: Record<AdminSalesStatus, string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_delivery: "bg-blue-50 text-blue-700 border-blue-200",
  finished: "bg-black/5 text-black border-black/15",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function SalesWorkbench({ initialOrders }: SalesWorkbenchProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminSalesStatus | "all">("all");
  const [channelFilter, setChannelFilter] = useState<"all" | "whatsapp" | "manual">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const counters = useMemo(() => {
    const count = (status: AdminSalesStatus) =>
      initialOrders.filter((order) => order.status === status).length;
    return {
      total: initialOrders.length,
      open: count("open"),
      paid: count("paid"),
      inDelivery: count("in_delivery"),
      finished: count("finished"),
      cancelled: count("cancelled"),
    };
  }, [initialOrders]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return initialOrders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (channelFilter !== "all" && order.channel !== channelFilter) return false;
      if (!normalized) return true;
      const haystack =
        `${order.orderNumber} ${order.customerName} ${order.customerPhone}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [initialOrders, query, statusFilter, channelFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold">Vendas</h2>
        <p className="text-sm text-muted-foreground">
          Base mockada para validar fluxo manual de pedidos.
        </p>
      </header>

      <div className="border border-black/10 bg-white p-3">
        <ul className="grid gap-1 text-sm">
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Total:</span>
            <span className="font-bold">{counters.total}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Abertos:</span>
            <span className="font-bold">{counters.open}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Pagos:</span>
            <span className="font-bold">{counters.paid}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Entrega:</span>
            <span className="font-bold">{counters.inDelivery}</span>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-1">
            <span className="font-semibold">Finalizados:</span>
            <span className="font-bold">{counters.finished}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="font-semibold">Cancelados:</span>
            <span className="font-bold">{counters.cancelled}</span>
          </li>
        </ul>
      </div>

      <div className="border border-black/10 bg-white p-3">
        <div className="grid gap-2 md:grid-cols-[1fr_180px_150px_auto]">
          <input
            className="h-10 border px-3 text-sm rounded-none"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por #pedido, cliente ou telefone"
            value={query}
          />
          <select
            className="h-10 border px-3 text-sm rounded-none"
            onChange={(event) => {
              setStatusFilter(event.target.value as AdminSalesStatus | "all");
              setPage(1);
            }}
            value={statusFilter}
          >
            <option value="all">Todos os status</option>
            <option value="open">Aberto</option>
            <option value="paid">Pago</option>
            <option value="in_delivery">Em entrega</option>
            <option value="finished">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            className="h-10 border px-3 text-sm rounded-none"
            onChange={(event) => {
              setChannelFilter(event.target.value as "all" | "whatsapp" | "manual");
              setPage(1);
            }}
            value={channelFilter}
          >
            <option value="all">Todos canais</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="manual">Manual</option>
          </select>
          <Button
            className="rounded-none"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setChannelFilter("all");
              setPage(1);
            }}
            type="button"
            variant="outline"
          >
            Limpar
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-black/10 bg-white">
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
            {pagedRows.map((order) => (
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
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground md:hidden">
        Deslize a tabela para o lado para ver todas as colunas.
      </p>

      <nav className="flex flex-wrap items-center justify-center gap-3 py-1">
        {safePage > 1 ? (
          <button className="rounded px-2 py-1 text-base font-semibold text-melier-ink hover:bg-[#ffe4ec]" onClick={() => setPage((current) => current - 1)} type="button">
            {"<"}
          </button>
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
              <button className="rounded px-2 py-1 text-base font-medium text-muted-foreground hover:bg-[#ffe4ec] hover:text-melier-ink" key={pageNumber} onClick={() => setPage(pageNumber)} type="button">
                {pageNumber}
              </button>
            ),
          )}
        </div>
        {safePage < totalPages ? (
          <button className="rounded px-2 py-1 text-base font-semibold text-melier-ink hover:bg-[#ffe4ec]" onClick={() => setPage((current) => current + 1)} type="button">
            {">"}
          </button>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">{">"}</span>
        )}
      </nav>
    </section>
  );
}

