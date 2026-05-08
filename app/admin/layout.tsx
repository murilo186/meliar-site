import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require-admin";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-melier-rose">
              Meliar
            </p>
            <h1 className="text-lg font-bold">Painel Admin</h1>
          </div>
          <Link
            className="text-sm font-semibold text-melier-ink underline underline-offset-2"
            href="/"
          >
            Ver loja
          </Link>
        </div>
      </header>

      <div className="container grid gap-4 py-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit border border-black/10 bg-white p-2">
          <nav className="grid gap-1 text-sm">
            <Link className="px-3 py-2 hover:bg-[#ffe4ec]" href="/admin/produtos">
              Produtos
            </Link>
            <Link className="px-3 py-2 hover:bg-[#ffe4ec]" href="/admin/estoque">
              Estoque
            </Link>
            <Link className="px-3 py-2 hover:bg-[#ffe4ec]" href="/admin/vendas">
              Vendas
            </Link>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
