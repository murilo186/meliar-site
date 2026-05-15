import Link from "next/link";
import Image from "next/image";
import { ProductImagePlaceholder } from "@/components/product/product-image-placeholder";
import { Button } from "@/components/ui/button";
import { UpdateOrderStatusButton } from "@/components/admin/update-order-status-button";
import { formatCurrency } from "@/lib/format";
import { buildOrderSupportWhatsAppUrl } from "@/lib/whatsapp/build-order-support-url";
import type { AdminSalesOrder, AdminSalesStatus } from "@/types/admin";

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

function isPersistedOrderId(orderId: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    orderId,
  );
}

export function SalesOrderDetail({ order }: { order: AdminSalesOrder }) {
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
        <Button asChild className="rounded-none" size="sm" variant="outline">
          <Link href="/admin/vendas">Voltar para Vendas</Link>
        </Button>
      </header>

      <div className="border border-black/10 bg-white p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex border px-2 py-0.5 text-xs ${statusClass[order.status]}`}>
              {statusLabel[order.status]}
            </span>
            {isPersistedOrderId(order.id) ? (
              <UpdateOrderStatusButton currentStatus={order.status} orderId={order.id} />
            ) : null}
          </div>
          <p className="text-sm font-semibold text-melier-ink">
            Total do pedido: {formatCurrency(order.totalCents / 100)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {order.items.map((item) => (
            <article className="border border-black/10 bg-white p-3" key={item.id}>
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                {item.imageUrl ? (
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    <Image
                      alt={`${item.productName} ${item.variantLabel}`}
                      className="object-cover"
                      fill
                      sizes="88px"
                      src={item.imageUrl}
                    />
                  </div>
                ) : (
                  <ProductImagePlaceholder className="aspect-square" />
                )}
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
      </div>

      {order.notes ? (
        <div className="border border-black/10 bg-white p-3 text-sm text-muted-foreground">
          Observação: {order.notes}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {isPersistedOrderId(order.id) ? (
          <UpdateOrderStatusButton
            confirmLabel="Cancelar pedido"
            confirmClassName="bg-red-600 text-white hover:bg-red-700"
            currentStatus={order.status}
            fixedNextStatus="cancelled"
            orderId={order.id}
            triggerLabel="Cancelar pedido"
            triggerClassName="bg-red-600 text-white hover:bg-red-700"
            triggerVariant="default"
          />
        ) : null}

        <Button asChild className="rounded-none" size="sm" variant="outline">
          <Link
            href={buildOrderSupportWhatsAppUrl({
              orderNumber: order.orderNumber,
              source: "admin",
              statusLabel: statusLabel[order.status],
              intent: "Estamos entrando em contato sobre este pedido.",
            })}
            target="_blank"
          >
            Entrar em contato com cliente
          </Link>
        </Button>
      </div>

      {!isPersistedOrderId(order.id) ? (
        <p className="text-xs text-muted-foreground">
          Ações de status ficam disponíveis quando o pedido está salvo no banco.
        </p>
      ) : null}
    </section>
  );
}
