"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { catalogCategories } from "@/data/categories";
import type { Subcategory } from "@/types/catalog";

interface DesktopNavItem {
  label: string;
  href: string;
  children?: Subcategory[];
}

const desktopNavItems: DesktopNavItem[] = [
  { label: "Novidades", href: "/produtos" },
  ...catalogCategories.map((category) => ({
    label: category.name,
    href: category.href,
    children: category.children,
  })),
  { label: "Contato", href: "/#contato" },
];

const mobileProductItems = catalogCategories.map((category) => ({
  label: category.name,
  href: category.href,
  children: category.children,
}));

const logoHeader = "/images/logo/logo_header1.png";

export function Header() {
  const [isCompact, setIsCompact] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [desktopHoverItem, setDesktopHoverItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 36);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerHeight = isCompact ? "h-[70px]" : "h-[98px]";
  const logoSize =
    isCompact ? "max-h-[44px] sm:max-h-[60px]" : "max-h-[66px] sm:max-h-[104px]";
  const logoOffset = isCompact ? "pt-0" : "pt-2";

  return (
    <header className="sticky top-0 z-[60] bg-white/88 backdrop-blur-md">
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
                    <Link
                      className="rounded-md px-2 py-2 text-sm font-bold text-melier-ink hover:bg-secondary"
                      href="/produtos"
                    >
                      Novidades
                    </Link>
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
                          if (item.children?.length) {
                            const isOpen = openGroup === item.label;

                            return (
                              <div className="px-2" key={item.label}>
                                <div className="flex items-center justify-between gap-2">
                                  <SheetClose asChild>
                                    <Link
                                      className="block flex-1 px-2 py-2 text-sm font-medium text-melier-ink/80 hover:text-melier-rose"
                                      href={item.href}
                                    >
                                      {item.label}
                                    </Link>
                                  </SheetClose>
                                  <button
                                    aria-label={`Abrir ${item.label}`}
                                    className="p-2 text-melier-ink/80"
                                    onClick={() =>
                                      setOpenGroup((current) =>
                                        current === item.label ? null : item.label,
                                      )
                                    }
                                    type="button"
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${
                                        isOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                </div>

                                <div
                                  className={`grid overflow-hidden transition-all duration-300 ${
                                    isOpen ? "grid-rows-[1fr] pb-1" : "grid-rows-[0fr]"
                                  }`}
                                >
                                  <div className="min-h-0">
                                    {item.children.map((child) => (
                                      <SheetClose asChild key={child.slug}>
                                        <Link
                                          className="block px-4 py-2 text-sm text-melier-ink/70 hover:text-melier-rose"
                                          href={child.href}
                                        >
                                          {child.name}
                                        </Link>
                                      </SheetClose>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <SheetClose asChild key={item.label}>
                              <Link
                                className="block px-4 py-2 text-sm font-medium text-melier-ink/80 hover:text-melier-rose"
                                href={item.href}
                              >
                                {item.label}
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <SheetClose asChild>
                    <Link
                      className="rounded-md px-2 py-2 text-sm font-bold text-melier-ink hover:bg-secondary"
                      href="/#contato"
                    >
                      Contato
                    </Link>
                  </SheetClose>
                </nav>
                <div className="mt-5 border-t pt-4 text-sm text-muted-foreground">
                  Busca preparada para conectar aos produtos na próxima etapa.
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

          <Link
            aria-label="Melier"
            className={`flex min-w-0 items-center justify-center overflow-hidden transition-all duration-300 ${logoOffset}`}
            href="/"
          >
            <img
              alt="Melier"
              className={`h-auto max-w-full object-contain transition-all duration-300 ${logoSize}`}
              src={logoHeader}
            />
          </Link>

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
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
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
                placeholder="Buscar por nome, categoria ou coleção"
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
        <div className="container relative flex items-center justify-center gap-7 overflow-visible py-3">
          {desktopNavItems.map((item) => {
            if (item.children?.length) {
              return (
                <div
                  className="relative"
                  key={item.label}
                  onMouseEnter={() => setDesktopHoverItem(item.label)}
                  onMouseLeave={() => setDesktopHoverItem(null)}
                >
                  <div className="flex items-center gap-1">
                    <Link
                      className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em] text-melier-ink transition-colors hover:text-melier-rose"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition ${
                        desktopHoverItem === item.label
                          ? "text-melier-rose"
                          : "text-melier-ink"
                      }`}
                    />
                  </div>

                  {desktopHoverItem === item.label ? (
                    <div className="absolute left-1/2 top-full z-[70] w-56 -translate-x-1/2 pt-2">
                      <div className="absolute inset-x-0 -top-2 h-2 bg-transparent" />
                      <div className="bg-white px-3 py-2 shadow-[0_12px_24px_rgba(17,17,17,0.08)]">
                        <div className="grid gap-1">
                          <Link
                            className="block px-2 py-1.5 text-sm font-bold text-melier-ink transition hover:text-melier-rose"
                            href={item.href}
                          >
                            Ver tudo em {item.label}
                          </Link>
                          {item.children.map((child) => (
                            <Link
                              className="block px-2 py-1.5 text-sm text-muted-foreground transition hover:text-melier-rose"
                              href={child.href}
                              key={child.slug}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em] text-melier-ink transition-colors hover:text-melier-rose"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
