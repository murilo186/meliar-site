import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductImagePlaceholder } from "@/components/product/product-image-placeholder";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCustomerOrderById } from "@/lib/orders/get-customer-orders";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildOrderSupportWhatsAppUrl } from "@/lib/whatsapp/build-order-support-url";

const statusLabel = {
  pending: "Novo",
  approved: "Em atendimento",
  paid: "Confirmado",
  delivered: "Entregue",
  cancelled: "Cancelado",
} as const;

const statusClass = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-black/5 text-black border-black/15",
  cancelled: "bg-red-50 text-red-700 border-red-200",
} as const;

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await getCustomerOrderById(user.id, id);

  if (!order) {
    notFound();
  }

  return (
    <section className="container py-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-black">Pedido {order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString("pt-BR")} •{" "}
              {order.channel === "whatsapp" ? "WhatsApp" : "Manual"}
            </p>
          </div>
          <span className={`inline-flex border px-2 py-0.5 text-xs ${statusClass[order.status]}`}>
            {statusLabel[order.status]}
          </span>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {order.items.map((item) => (
            <article className="border border-black/10 bg-white p-3" key={item.id}>
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                {item.imageUrl ? (
                  <img
                    alt={`${item.productName} ${item.variantLabel}`}
                    className="aspect-square w-full object-cover"
                    src={item.imageUrl}
                  />
                ) : (
                  <ProductImagePlaceholder className="aspect-square" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Qtd: {item.quantity} • Unitário: {formatCurrency(item.unitPriceCents / 100)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-black">
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
          <p className="text-sm font-semibold text-black">
            Total do pedido: {formatCurrency(order.totalCents / 100)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-none" size="sm">
            <Link
              href={buildOrderSupportWhatsAppUrl({
                orderNumber: order.orderNumber,
                source: "cliente",
                statusLabel: statusLabel[order.status],
                intent: "Quero atualizar o andamento deste pedido.",
              })}
              target="_blank"
            >
              Falar sobre este pedido no WhatsApp
            </Link>
          </Button>
          <Button asChild className="rounded-none" size="sm" variant="outline">
            <Link href="/perfil">Voltar para Perfil</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
