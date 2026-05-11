"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/estoque", label: "Estoque" },
  { href: "/admin/vendas", label: "Vendas" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1 text-sm">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            className={`flex items-center gap-2 px-3 py-2 ${
              isActive ? "bg-[#ffe4ec] font-semibold text-melier-ink" : "hover:bg-[#ffe4ec]"
            }`}
            href={item.href}
            key={item.href}
          >
            <span className={`${isActive ? "text-melier-rose" : "text-transparent"}`}>|</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

