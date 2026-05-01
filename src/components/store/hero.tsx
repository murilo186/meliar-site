import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="border-b bg-white">
      <div className="container grid gap-3 py-4 sm:grid-cols-[1fr_0.72fr] sm:items-stretch sm:py-5">
        <div className="flex min-h-44 flex-col justify-between rounded-2xl border bg-melier-shell/55 p-4 sm:min-h-56 sm:p-5">
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-melier-rose">
              Nova seleção
            </p>
            <h1 className="max-w-lg font-display text-3xl font-bold leading-[0.95] tracking-tight text-melier-ink sm:text-5xl">
              Moda feminina para comprar sem rodeio
            </h1>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="max-w-xs text-sm font-semibold leading-5 text-muted-foreground">
              Peças novas, categorias rápidas e produtos em destaque logo no início.
            </p>
            <Button asChild className="shrink-0" size="sm">
              <a href="#produtos">
                Ver peças
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          <a
            className="group flex min-h-28 flex-col justify-end rounded-2xl border bg-white p-3 hover:border-melier-rose"
            href="#produtos"
          >
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-melier-rose">
              Mais vistos
            </span>
            <span className="mt-1 text-base font-extrabold text-melier-ink group-hover:text-melier-rose">
              Vestidos
            </span>
          </a>
          <a
            className="group flex min-h-28 flex-col justify-end rounded-2xl border bg-melier-ink p-3 text-white hover:border-melier-rose"
            href="#produtos"
          >
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-melier-blush">
              Pronta entrega
            </span>
            <span className="mt-1 text-base font-extrabold group-hover:text-melier-blush">
              Conjuntos
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
