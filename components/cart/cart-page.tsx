"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/use-cart";
import { useAuthAction } from "@/components/providers/auth-action-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

export function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
  } = useCart();
  const { requireAuth } = useAuthAction();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleWhatsAppCheckout = async () => {
    if (!requireAuth("finalizar seu pedido no WhatsApp")) {
      return;
    }

    if (items.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const payload = (await response.json()) as
        | { whatsappUrl: string }
        | { message?: string };

      if (!response.ok || !("whatsappUrl" in payload)) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Não foi possível iniciar o atendimento no WhatsApp.",
        );
      }

      clearCart();
      const popup = window.open(payload.whatsappUrl, "_blank", "noopener,noreferrer");

      if (!popup) {
        window.location.href = payload.whatsappUrl;
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o atendimento no WhatsApp.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="bg-white py-8 sm:py-10">
        <div className="container max-w-3xl">
          <div className="rounded-[1.75rem] border border-black/10 bg-[#fcfbf9] px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-melier-rose">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-melier-ink">
              Sua sacola está vazia
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
              Adicione peças para montar seu pedido e finalizar pelo WhatsApp.
            </p>
            <Button asChild className="mt-6 rounded-none px-6">
              <Link href="/produtos">Ver produtos</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="container">
        <div className="mb-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
            Sacola
          </p>
          <h1 className="mt-2 text-3xl font-black text-melier-ink">
            Revise seu pedido
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "itens"} prontos para seguir ao atendimento.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-3">
            {items.map((item) => {
              const lineSubtotal = item.selection.price * item.quantity;

              return (
                <article
                  className="grid grid-cols-[96px_1fr] gap-4 border border-black/10 bg-white p-3 sm:grid-cols-[120px_1fr]"
                  key={item.selection.id}
                >
                  <img
                    alt={item.selection.name}
                    className="aspect-[4/5] w-full object-cover"
                    src={item.selection.image}
                  />

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-black leading-tight text-melier-ink">
                          {item.selection.name}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Cor: {item.selection.color}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Tamanho: {item.selection.size}
                        </p>
                      </div>
                      <button
                        aria-label={`Remover ${item.selection.name}`}
                        className="p-1 text-muted-foreground transition hover:text-melier-rose"
                        onClick={() => {
                          if (!requireAuth("editar sua sacola")) return;
                          removeItem(item.selection.id);
                        }}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex items-center border border-black/15">
                        <button
                          aria-label={`Diminuir quantidade de ${item.selection.name}`}
                          className="flex h-10 w-10 items-center justify-center text-melier-ink transition hover:text-melier-rose"
                          onClick={() => {
                            if (!requireAuth("editar sua sacola")) return;
                            decreaseItem(item.selection.id);
                          }}
                          type="button"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex h-10 min-w-10 items-center justify-center border-x border-black/15 px-3 text-sm font-extrabold text-melier-ink">
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Aumentar quantidade de ${item.selection.name}`}
                          className="flex h-10 w-10 items-center justify-center text-melier-ink transition hover:text-melier-rose"
                          onClick={() => {
                            if (!requireAuth("editar sua sacola")) return;
                            addItem(item.selection);
                          }}
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                          {formatCurrency(item.selection.price)} cada
                        </p>
                        <p className="mt-1 text-lg font-black text-melier-ink">
                          {formatCurrency(lineSubtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit border border-black/10 bg-[#fcfbf9] p-5 lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-melier-ink">Resumo</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Itens</span>
                <span className="text-melier-ink">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-melier-ink">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Frete</span>
                <span className="text-melier-rose">Combinar no atendimento</span>
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Total
                </span>
                <span className="text-2xl font-black text-melier-ink">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <Button
                className="h-11 rounded-none"
                disabled={isSubmitting}
                onClick={handleWhatsAppCheckout}
                type="button"
              >
                {isSubmitting ? "Enviando pedido..." : "Finalizar no WhatsApp"}
              </Button>
              <Button
                className="h-11 rounded-none"
                onClick={() => {
                  if (!requireAuth("limpar sua sacola")) return;
                  clearCart();
                }}
                type="button"
                variant="outline"
              >
                Limpar sacola
              </Button>
            </div>

            {checkoutError ? (
              <p className="mt-3 text-xs font-semibold text-red-600">{checkoutError}</p>
            ) : null}

            <p className="mt-4 text-xs font-semibold leading-5 text-muted-foreground">
              Ao continuar, o WhatsApp abrirá com os itens do pedido para combinar entrega e pagamento.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
