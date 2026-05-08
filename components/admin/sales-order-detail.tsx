"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { AdminSalesOrder, AdminSalesStatus } from "@/types/admin";

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

const allowedTransitions: Record<AdminSalesStatus, AdminSalesStatus[]> = {
  open: ["paid", "in_delivery", "cancelled"],
  paid: ["in_delivery", "cancelled"],
  in_delivery: ["finished", "cancelled"],
  finished: [],
  cancelled: [],
};

function buildWhatsAppOrderUrl(order: AdminSalesOrder) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const clean = number.replace(/\D/g, "");
  if (!clean) return "#";
  const message = `Olá, sobre o pedido ${order.orderNumber}.`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function SalesOrderDetail({ order }: { order: AdminSalesOrder }) {
  const [currentStatus, setCurrentStatus] = useState<AdminSalesStatus>(order.status);

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Pedido {order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {order.customerName} • {order.customerPhone}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("pt-BR")} • Canal:{" "}
            {order.channel === "whatsapp" ? "WhatsApp" : "Manual"}
          </p>
        </div>
        <span className={`inline-flex border px-2 py-0.5 text-xs ${statusClass[currentStatus]}`}>
          {statusLabel[currentStatus]}
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {order.items.map((item) => (
          <article className="border border-black/10 bg-white p-3" key={item.id}>
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
              <img
                alt={`${item.productName} ${item.variantLabel}`}
                className="aspect-square w-full object-cover"
                src={item.imageUrl}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Qtd: {item.quantity} • Unitário: {formatCurrency(item.unitPriceCents / 100)}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Subtotal: {formatCurrency(item.subtotalCents / 100)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {order.notes ? (
        <div className="border border-black/10 bg-white p-3 text-sm text-muted-foreground">
          Observação: {order.notes}
        </div>
      ) : null}

      <div className="border border-black/10 bg-white p-3">
        <p className="text-sm font-semibold">
          Total do pedido: {formatCurrency(order.totalCents / 100)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {allowedTransitions[currentStatus].map((nextStatus) => (
          <Button
            className="rounded-none"
            key={nextStatus}
            onClick={() => setCurrentStatus(nextStatus)}
            size="sm"
            type="button"
            variant="outline"
          >
            Marcar como {statusLabel[nextStatus].toLowerCase()}
          </Button>
        ))}
        <Button asChild className="rounded-none" size="sm" variant="outline">
          <Link href={buildWhatsAppOrderUrl(order)} target="_blank">
            Abrir WhatsApp
          </Link>
        </Button>
        <Button asChild className="rounded-none" size="sm" variant="outline">
          <Link href="/admin/vendas">Voltar para Vendas</Link>
        </Button>
      </div>
    </section>
  );
}
