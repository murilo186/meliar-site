"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/use-cart";
import { useAuthAction } from "@/components/providers/auth-action-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types/cart";

const CHECKOUT_CONTEXT_STORAGE_KEY = "meliar-last-checkout";

interface CheckoutValidationIssue {
  selectionId: string;
  productSlug: string;
  productName: string;
  color: string;
  size: string;
  requestedQuantity: number;
  availableQuantity: number;
  message: string;
}

interface CheckoutValidationResponse {
  hasBlockingIssues: boolean;
  hasPriceChanges: boolean;
  subtotal: number;
  total: number;
  issues: CheckoutValidationIssue[];
}

interface CheckoutStartResponse {
  orderId: string;
  orderNumber: string;
  whatsappUrl: string;
}

interface CheckoutContext {
  orderId: string;
  orderNumber: string;
  whatsappUrl: string;
  createdAt: string;
}

function persistCheckoutContext(value: CheckoutContext | null) {
  try {
    if (!value) {
      window.sessionStorage.removeItem(CHECKOUT_CONTEXT_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(
      CHECKOUT_CONTEXT_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // Ignore storage failures in private mode or restricted contexts.
  }
}

function loadCheckoutContext() {
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutContext;
    if (!parsed?.orderId || !parsed?.orderNumber || !parsed?.whatsappUrl) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function tryOpenWhatsApp(url: string) {
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  return Boolean(popup);
}

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
  const [isValidatingCart, setIsValidatingCart] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [whatsAppOpenWarning, setWhatsAppOpenWarning] = useState<string | null>(null);
  const [cartValidation, setCartValidation] = useState<CheckoutValidationResponse | null>(
    null,
  );
  const [checkoutContext, setCheckoutContext] = useState<CheckoutContext | null>(null);

  useEffect(() => {
    setCheckoutContext(loadCheckoutContext());
  }, []);

  const clearCheckoutContext = useCallback(() => {
    setCheckoutContext(null);
    persistCheckoutContext(null);
  }, []);

  const requestCartValidation = useCallback(async (snapshot: CartItem[]) => {
    if (snapshot.length === 0) {
      setCartValidation(null);
      return null;
    }

    setIsValidatingCart(true);

    try {
      const response = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: snapshot }),
      });

      const payload = (await response.json()) as
        | CheckoutValidationResponse
        | { message?: string };

      if (!response.ok || !("hasBlockingIssues" in payload)) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Não foi possível validar a sacola.",
        );
      }

      setCartValidation(payload);
      if (payload.hasBlockingIssues) {
        setCheckoutError(
          "Alguns itens da sacola ficaram indisponíveis. Revise antes de finalizar.",
        );
      } else {
        setCheckoutError(null);
      }

      return payload;
    } catch (error) {
      setCartValidation(null);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Não foi possível validar a sacola.",
      );
      return null;
    } finally {
      setIsValidatingCart(false);
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      setCartValidation(null);
      setCheckoutError(null);
      setIsValidatingCart(false);
      return;
    }

    void requestCartValidation(items);
  }, [items, requestCartValidation]);

  const handleOpenWhatsAppAgain = () => {
    if (!checkoutContext) {
      return;
    }

    const opened = tryOpenWhatsApp(checkoutContext.whatsappUrl);
    if (opened) {
      setWhatsAppOpenWarning(null);
      return;
    }

    setWhatsAppOpenWarning(
      "Não foi possível abrir automaticamente. Use o botão abaixo para abrir no mesmo navegador.",
    );
  };

  const handleWhatsAppCheckout = async () => {
    if (!requireAuth("finalizar seu pedido no WhatsApp")) {
      return;
    }

    if (items.length === 0 || isSubmitting || isValidatingCart) {
      return;
    }

    const latestValidation = await requestCartValidation(items);
    if (!latestValidation) {
      return;
    }

    if (latestValidation.hasBlockingIssues) {
      setCheckoutError(
        "Existem itens indisponíveis na sacola. Ajuste antes de finalizar.",
      );
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);
    setWhatsAppOpenWarning(null);

    try {
      const response = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const payload = (await response.json()) as
        | CheckoutStartResponse
        | { message?: string };

      if (!response.ok || !("whatsappUrl" in payload)) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Não foi possível iniciar o atendimento no WhatsApp.",
        );
      }

      const context: CheckoutContext = {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        whatsappUrl: payload.whatsappUrl,
        createdAt: new Date().toISOString(),
      };

      setCheckoutContext(context);
      persistCheckoutContext(context);
      clearCart();
      setCartValidation(null);

      const opened = tryOpenWhatsApp(payload.whatsappUrl);
      if (!opened) {
        setWhatsAppOpenWarning(
          "Seu pedido foi criado, mas o WhatsApp não abriu automaticamente.",
        );
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
          {checkoutContext ? (
            <div className="mb-4 border border-emerald-300 bg-emerald-50 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                Pedido criado
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-800">
                Número do pedido: {checkoutContext.orderNumber}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button className="h-10 rounded-none" onClick={handleOpenWhatsAppAgain} type="button">
                  Abrir WhatsApp
                </Button>
                <Button asChild className="h-10 rounded-none" type="button" variant="outline">
                  <Link href={`/perfil/pedidos/${checkoutContext.orderId}`}>Ver pedido</Link>
                </Button>
              </div>
              {whatsAppOpenWarning ? (
                <div className="mt-3 border border-amber-300 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-700">{whatsAppOpenWarning}</p>
                  <Link
                    className="mt-2 inline-block text-xs font-bold text-amber-700 underline"
                    href={checkoutContext.whatsappUrl}
                    target="_blank"
                  >
                    Abrir WhatsApp neste navegador
                  </Link>
                </div>
              ) : null}
              <button
                className="mt-3 text-xs font-semibold text-muted-foreground underline"
                onClick={clearCheckoutContext}
                type="button"
              >
                Ocultar confirmação
              </button>
            </div>
          ) : null}

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
        {checkoutContext ? (
          <div className="mb-4 border border-emerald-300 bg-emerald-50 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-700">
              Pedido criado
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-800">
              Número do pedido: {checkoutContext.orderNumber}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button className="h-10 rounded-none" onClick={handleOpenWhatsAppAgain} type="button">
                Abrir WhatsApp
              </Button>
              <Button asChild className="h-10 rounded-none" type="button" variant="outline">
                <Link href={`/perfil/pedidos/${checkoutContext.orderId}`}>Ver pedido</Link>
              </Button>
            </div>
            {whatsAppOpenWarning ? (
              <div className="mt-3 border border-amber-300 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-700">{whatsAppOpenWarning}</p>
                <Link
                  className="mt-2 inline-block text-xs font-bold text-amber-700 underline"
                  href={checkoutContext.whatsappUrl}
                  target="_blank"
                >
                  Abrir WhatsApp neste navegador
                </Link>
              </div>
            ) : null}
            <button
              className="mt-3 text-xs font-semibold text-muted-foreground underline"
              onClick={clearCheckoutContext}
              type="button"
            >
              Ocultar confirmação
            </button>
          </div>
        ) : null}

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
          {isValidatingCart ? (
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              Validando disponibilidade da sacola...
            </p>
          ) : null}
          {cartValidation?.hasPriceChanges ? (
            <p className="mt-2 text-xs font-semibold text-amber-700">
              Alguns preços foram atualizados. O total final será recalculado no checkout.
            </p>
          ) : null}
          {cartValidation?.hasBlockingIssues ? (
            <div className="mt-3 border border-red-300 bg-red-50 p-3">
              <p className="text-xs font-bold text-red-700">
                Existem itens indisponíveis na sacola:
              </p>
              <ul className="mt-1 space-y-1">
                {cartValidation.issues.map((issue, index) => (
                  <li className="text-xs font-semibold text-red-700" key={`${issue.selectionId}:${index}`}>
                    • {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
                        onClick={() => removeItem(item.selection.id)}
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
                          onClick={() => decreaseItem(item.selection.id)}
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
                          onClick={() => addItem(item.selection)}
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
                disabled={
                  isSubmitting ||
                  isValidatingCart ||
                  Boolean(cartValidation?.hasBlockingIssues)
                }
                onClick={handleWhatsAppCheckout}
                type="button"
              >
                {isSubmitting
                  ? "Enviando pedido..."
                  : isValidatingCart
                  ? "Validando sacola..."
                  : cartValidation?.hasBlockingIssues
                  ? "Revise os itens indisponíveis"
                  : "Finalizar no WhatsApp"}
              </Button>
              <Button
                className="h-11 rounded-none"
                onClick={clearCart}
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
