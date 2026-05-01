import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoHeader from "../../../images/logo/logo_header1.png";
import { CartDrawer } from "./cart-drawer";

const desktopNavItems = [
  { label: "Novidades", href: "#produtos" },
  { label: "Vestidos", href: "#produtos" },
  { label: "Partes de cima", href: "#produtos" },
  { label: "Partes de baixo", href: "#produtos" },
  { label: "Conjuntos", href: "#produtos" },
  { label: "Contato", href: "#contato" },
];

const mobileProductItems = [
  {
    label: "Partes de baixo",
    children: ["Calças", "Saias"],
  },
  {
    label: "Partes de cima",
    children: ["Cropped"],
  },
  {
    label: "Vestidos",
  },
  {
    label: "Conjuntos",
  },
];

export function Header() {
  const [isCompact, setIsCompact] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [isTopOpen, setIsTopOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 36);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerHeight = isCompact ? "h-[70px]" : "h-[98px]";
  const logoSize = isCompact ? "max-h-[44px] sm:max-h-[60px]" : "max-h-[66px] sm:max-h-[104px]";
  const logoOffset = isCompact ? "pt-0" : "pt-2";

  return (
    <header className="sticky top-0 z-40 bg-white/88 backdrop-blur-md">
      <div>
        <div
          className={`container grid grid-cols-[56px_1fr_56px] items-center transition-all duration-300 lg:grid-cols-[280px_1fr_280px] ${headerHeight}`}
        >
          <div className="z-10 flex min-w-0 items-center justify-start">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  aria-label="Abrir menu"
                  className="-ml-2 text-melier-ink lg:hidden"
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
                <form
                  action="#"
                  className="mb-5 flex items-center gap-2 border-b border-border pb-4"
                  role="search"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    aria-label="Buscar produtos"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    name="search"
                    placeholder="Buscar produtos"
                    type="search"
                  />
                </form>
                <nav className="grid gap-1">
                  <SheetClose asChild>
                    <a
                      className="rounded-md px-2 py-2 text-sm font-bold text-melier-ink hover:bg-secondary"
                      href="#produtos"
                    >
                      Novidades
                    </a>
                  </SheetClose>

                  <div className="rounded-md border border-black/8">
                    <button
                      className="flex w-full items-center justify-between px-2 py-2 text-left text-sm font-bold text-melier-ink"
                      onClick={() => setIsProductsOpen((open) => !open)}
                      type="button"
                    >
                      <span>Produtos</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isProductsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid overflow-hidden transition-all duration-300 ${
                        isProductsOpen ? "grid-rows-[1fr] pb-2" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0">
                        {mobileProductItems.map((item) => {
                          if (item.label === "Partes de baixo") {
                            return (
                              <div className="px-2" key={item.label}>
                                <button
                                  className="flex w-full items-center justify-between px-2 py-2 text-left text-sm font-medium text-melier-ink/80"
                                  onClick={() => setIsBottomOpen((open) => !open)}
                                  type="button"
                                >
                                  <span>{item.label}</span>
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                      isBottomOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                                <div
                                  className={`grid overflow-hidden transition-all duration-300 ${
                                    isBottomOpen
                                      ? "grid-rows-[1fr] pb-1"
                                      : "grid-rows-[0fr]"
                                  }`}
                                >
                                  <div className="min-h-0">
                                    {item.children?.map((child) => (
                                      <SheetClose asChild key={child}>
                                        <a
                                          className="block px-4 py-2 text-sm text-melier-ink/70 hover:text-melier-rose"
                                          href="#produtos"
                                        >
                                          {child}
                                        </a>
                                      </SheetClose>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (item.label === "Partes de cima") {
                            return (
                              <div className="px-2" key={item.label}>
                                <button
                                  className="flex w-full items-center justify-between px-2 py-2 text-left text-sm font-medium text-melier-ink/80"
                                  onClick={() => setIsTopOpen((open) => !open)}
                                  type="button"
                                >
                                  <span>{item.label}</span>
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                      isTopOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                                <div
                                  className={`grid overflow-hidden transition-all duration-300 ${
                                    isTopOpen
                                      ? "grid-rows-[1fr] pb-1"
                                      : "grid-rows-[0fr]"
                                  }`}
                                >
                                  <div className="min-h-0">
                                    {item.children?.map((child) => (
                                      <SheetClose asChild key={child}>
                                        <a
                                          className="block px-4 py-2 text-sm text-melier-ink/70 hover:text-melier-rose"
                                          href="#produtos"
                                        >
                                          {child}
                                        </a>
                                      </SheetClose>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <SheetClose asChild key={item.label}>
                              <a
                                className="block px-4 py-2 text-sm font-medium text-melier-ink/80 hover:text-melier-rose"
                                href="#produtos"
                              >
                                {item.label}
                              </a>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <SheetClose asChild>
                    <a
                      className="rounded-md px-2 py-2 text-sm font-bold text-melier-ink hover:bg-secondary"
                      href="#contato"
                    >
                      Contato
                    </a>
                  </SheetClose>
                </nav>
                <div className="mt-5 border-t pt-4 text-sm text-muted-foreground">
                  Busca preparada para conectar aos produtos na proxima etapa.
                </div>
              </SheetContent>
            </Sheet>
            <form
              action="#"
              className="hidden w-full max-w-[280px] items-center gap-2 border-b border-black/25 pb-2 lg:flex"
              role="search"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                aria-label="Buscar produtos"
                className="w-full bg-transparent text-[11px] uppercase tracking-[0.2em] text-melier-ink outline-none placeholder:text-[#6f6f6f]"
                name="search"
                placeholder="Buscar todo o site"
                type="search"
              />
            </form>
          </div>

          <a
            aria-label="Melier"
            className={`flex min-w-0 items-center justify-center overflow-hidden transition-all duration-300 ${logoOffset}`}
            href="#"
          >
            <img
              alt="Melier"
              className={`h-auto max-w-full object-contain transition-all duration-300 ${logoSize}`}
              src={logoHeader}
            />
          </a>

          <div className="z-10 flex items-center justify-end gap-1 sm:gap-2">
            <Button
              aria-controls="header-search-panel"
              aria-expanded={isSearchOpen}
              aria-label="Abrir busca"
              className="text-melier-ink lg:hidden"
              onClick={() => setIsSearchOpen((open) => !open)}
              size="icon"
              type="button"
              variant="ghost"
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
            <CartDrawer />
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden border-b border-border/60 transition-all duration-300 ${
          isSearchOpen ? "max-h-28 opacity-100" : "max-h-0 opacity-0"
        }`}
        id="header-search-panel"
      >
        <div className="container py-3">
          <form
            action="#"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            role="search"
          >
            <label className="sr-only" htmlFor="header-search-input">
              Buscar produtos
            </label>
            <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-white px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                id="header-search-input"
                name="search"
                placeholder="Buscar por nome, categoria ou colecao"
                type="search"
              />
            </div>
            <Button className="sm:min-w-32" type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </div>
      </div>

      <nav className="hidden border-b border-black/10 lg:block">
        <div className="container flex items-center justify-center gap-7 overflow-x-auto py-3">
          {desktopNavItems.map((item) => (
            <a
              className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em] text-melier-ink transition-colors hover:text-melier-rose"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
