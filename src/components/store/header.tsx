import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories } from "@/data/products";
import { CartDrawer } from "./cart-drawer";

const navItems = ["Novidades", "Mais vendidos", "Vestidos", "Conjuntos"];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/88 backdrop-blur-sm">
      <div className="border-b bg-melier-ink py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white">
        Frete grátis acima de R$ 299
      </div>
      <div className="container relative flex h-14 items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Abrir menu"
                className="-ml-2 text-melier-ink"
                size="icon"
                variant="ghost"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1">
                {categories.map((category) => (
                  <SheetClose asChild key={category}>
                    <a
                      className="rounded-md px-2 py-2 text-sm font-bold text-melier-ink hover:bg-secondary"
                      href="#produtos"
                    >
                      {category}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-5 border-t pt-4 text-sm text-muted-foreground">
                Trocas simples e envio para todo o Brasil.
              </div>
            </SheetContent>
          </Sheet>
          <nav className="ml-2 hidden items-center gap-5 lg:flex">
            {navItems.map((item) => (
              <a
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-melier-ink hover:text-melier-rose"
                href="#produtos"
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <a
          aria-label="Melier"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          href="#"
        >
          <img
            alt="Melier"
            className="h-[160px] w-auto object-contain sm:h-[132px]"
            src="/logo.png"
          />
        </a>

        <div className="flex flex-1 items-center justify-end gap-1">
          <Button
            aria-label="Buscar"
            className="text-melier-ink"
            size="icon"
            variant="ghost"
          >
            <Search className="h-5 w-5" />
          </Button>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
