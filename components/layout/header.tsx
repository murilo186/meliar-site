"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, Search, Shield, User } from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";
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
  { label: "Produtos", href: "/produtos" },
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
  const searchParams = useSearchParams();
  const currentQuery = searchParams?.get("q") ?? "";
  const [isCompact, setIsCompact] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [desktopHoverItem, setDesktopHoverItem] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact((currentValue) => {
        const nextScrollY = window.scrollY;

        if (!currentValue && nextScrollY > 56) {
          return true;
        }

        if (currentValue && nextScrollY < 20) {
          return false;
        }

        return currentValue;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClientOrNull();
    if (!supabase) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setFirstName("");
      return;
    }
    const browserClient = supabase;

    async function loadUserState() {
      const {
        data: { user },
      } = await browserClient.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setFirstName("");
        return;
      }

      setIsAuthenticated(true);
      const { data: profile } = await browserClient
        .from("profiles")
        .select("first_name,role")
        .eq("id", user.id)
        .maybeSingle();
      setFirstName(profile?.first_name?.trim() || "Cliente");
      setIsAdmin(profile?.role === "admin");
    }

    void loadUserState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUserState();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!profileMenuRef.current) return;
      if (profileMenuRef.current.contains(event.target as Node)) return;
      setIsProfileMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClientOrNull();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsProfileMenuOpen(false);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setFirstName("");
    window.location.href = "/";
  }

  const headerHeight = isCompact ? "h-[70px]" : "h-[98px]";
  const logoSize =
    isCompact ? "max-h-[44px] sm:max-h-[60px]" : "max-h-[66px] sm:max-h-[104px]";
  const logoOffset = isCompact ? "pt-0" : "pt-2";

  return (
    <header className="sticky top-0 z-[60] bg-white/88 backdrop-blur-md">
      <div>
        <div
          className={`container grid grid-cols-[56px_1fr_auto] items-center gap-1 transition-all duration-300 lg:grid-cols-[280px_1fr_280px] ${headerHeight}`}
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
                  action="/produtos"
                  className="mb-5 flex items-center gap-2 border-b border-border pb-4"
                  method="get"
                  role="search"
                >
                  <button
                    aria-label="Buscar"
                    className="text-muted-foreground transition hover:text-melier-rose"
                    type="submit"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <input
                    aria-label="Buscar produtos"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    defaultValue={currentQuery}
                    name="q"
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
                      Produtos
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
              </SheetContent>
            </Sheet>

            <form
              action="/produtos"
              className="hidden w-full max-w-[280px] items-center gap-2 border-b border-black/25 pb-2 lg:flex"
              method="get"
              role="search"
            >
              <button
                aria-label="Buscar"
                className="text-muted-foreground transition hover:text-melier-rose"
                type="submit"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                aria-label="Buscar produtos"
                className="w-full bg-transparent text-[11px] uppercase tracking-[0.2em] text-melier-ink outline-none placeholder:text-[#6f6f6f]"
                defaultValue={currentQuery}
                name="q"
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

          <div className="z-10 flex min-w-0 items-center justify-end gap-1 sm:gap-2">
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  className="flex max-w-[106px] flex-col items-start rounded-md px-2 py-1 text-left leading-tight sm:max-w-[150px]"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                  type="button"
                >
                  <span className="block text-[9px] font-medium uppercase tracking-[0.14em] text-black sm:text-[10px]">
                    Bem-vindo
                  </span>
                  <span className="w-full truncate text-sm font-semibold text-melier-rose">{firstName}</span>
                </button>

                {isProfileMenuOpen ? (
                  <div className="absolute right-0 top-full z-[80] mt-2 w-44 border border-black/10 bg-white p-1 shadow-[0_10px_24px_rgba(17,17,17,0.12)]">
                    <Link
                      className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-[#ffe4ec]"
                      href="/perfil"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Perfil
                    </Link>
                    <Link
                      className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-[#ffe4ec]"
                      href="/perfil#favoritos"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favoritos
                    </Link>
                    {isAdmin ? (
                      <Link
                        className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-[#ffe4ec]"
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                    ) : null}
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-black hover:bg-[#ffe4ec]"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Button
                asChild
                aria-label="Entrar"
                className="text-melier-ink"
                size="icon"
                variant="ghost"
              >
                <Link href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <CartDrawer />
          </div>
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
