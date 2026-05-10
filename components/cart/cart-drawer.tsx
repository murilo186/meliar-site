"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthAction } from "@/components/providers/auth-action-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart/use-cart";

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    lastAddedSelectionId,
    lastAddedAt,
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
  } = useCart();
  const { requireAuth } = useAuthAction();
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (!lastAddedAt) {
      return;
    }

    setIsPulsing(true);
    const timeout = window.setTimeout(() => setIsPulsing(false), 700);

    return () => window.clearTimeout(timeout);
  }, [lastAddedAt]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label={`Sacola com ${itemCount} itens`}
          className={`relative text-melier-ink transition-transform duration-300 ${
            isPulsing ? "scale-110" : ""
          }`}
          size="icon"
          variant="ghost"
        >
          <ShoppingBag className={`h-5 w-5 transition ${isPulsing ? "text-melier-rose" : ""}`} />
          {isPulsing ? (
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-melier-rose" />
          ) : null}
          {itemCount > 0 ? (
            <span
              className={`absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-melier-rose px-1 text-[10px] font-extrabold leading-none text-white ${
                isPulsing ? "animate-pulse" : ""
              }`}
            >
              {itemCount}
            </span>
          ) : (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-melier-rose" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0" side="right">
        <SheetHeader className="mb-0 border-b p-4 pr-12">
          <SheetTitle>Sacola</SheetTitle>
          <p className="text-sm font-semibold text-muted-foreground">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? "item" : "itens"} selecionados`
              : "Sua sacola está vazia"}
          </p>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-melier-rose">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="font-display text-xl font-bold text-melier-ink">
              Escolha suas peças
            </p>
            <p className="mx-auto mt-2 max-w-56 text-sm font-semibold leading-5 text-muted-foreground">
              Adicione produtos para ver o resumo da compra aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="grid gap-3">
                {items.map((item) => (
                  <article
                    className={`grid grid-cols-[76px_1fr] gap-3 rounded-2xl border bg-white p-2 transition ${
                      lastAddedSelectionId === item.selection.id
                        ? "ring-1 ring-melier-rose/40"
                        : ""
                    }`}
                    key={item.selection.id}
                  >
                    <img
                      alt={item.selection.name}
                      className="aspect-[4/5] w-full rounded-xl bg-muted object-cover"
                      src={item.selection.image}
                    />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-melier-ink">
                            {item.selection.name}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {item.selection.color}
                          </p>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            Tam. {item.selection.size}
                          </p>
                        </div>
                        <button
                          aria-label={`Remover ${item.selection.name}`}
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-melier-rose"
                          onClick={() => {
                            if (!requireAuth("editar sua sacola")) return;
                            removeItem(item.selection.id);
                          }}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-full border">
                          <button
                            aria-label={`Diminuir quantidade de ${item.selection.name}`}
                            className="p-2 text-melier-ink hover:text-melier-rose"
                            onClick={() => {
                              if (!requireAuth("editar sua sacola")) return;
                              decreaseItem(item.selection.id);
                            }}
                            type="button"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-extrabold">
                            {item.quantity}
                          </span>
                          <button
                            aria-label={`Aumentar quantidade de ${item.selection.name}`}
                            className="p-2 text-melier-ink hover:text-melier-rose"
                            onClick={() => {
                              if (!requireAuth("editar sua sacola")) return;
                              addItem(item.selection);
                            }}
                            type="button"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-extrabold text-melier-ink">
                          {formatCurrency(item.selection.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="border-t bg-white p-4">
              <div className="mb-3 grid gap-2 text-sm font-bold">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-melier-ink">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-melier-rose">Combinar no atendimento</span>
                </div>
              </div>
              <SheetClose asChild>
                <Button asChild className="w-full rounded-none">
                  <Link href="/carrinho">Finalizar pedido</Link>
                </Button>
              </SheetClose>
              <button
                className="mt-3 w-full text-center text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground hover:text-melier-rose"
                onClick={() => {
                  if (!requireAuth("limpar sua sacola")) return;
                  clearCart();
                }}
                type="button"
              >
                Limpar sacola
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
