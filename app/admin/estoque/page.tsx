import { createSupabaseServerClient } from "@/lib/supabase/server";

type StockRow = {
  id: string;
  sku: string;
  stock_quantity: number;
  products: { name: string } | { name: string }[] | null;
  colors: { name: string } | { name: string }[] | null;
  sizes: { name: string } | { name: string }[] | null;
};

export default async function AdminStockPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: variants }, { count: movementsCount }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id,sku,stock_quantity,products(name),colors(name),sizes(name)")
      .order("stock_quantity", { ascending: true })
      .limit(80),
    supabase.from("inventory_movements").select("id", { count: "exact", head: true }),
  ]);

  const rows = (variants ?? []) as StockRow[];

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold">Estoque</h2>
        <p className="text-sm text-muted-foreground">
          Variantes cadastradas e saldo atual. Movimentos registrados: {movementsCount ?? 0}.
        </p>
      </header>

      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#ffe4ec] text-left">
            <tr>
              <th className="px-3 py-2 font-semibold">Produto</th>
              <th className="px-3 py-2 font-semibold">Cor</th>
              <th className="px-3 py-2 font-semibold">Tamanho</th>
              <th className="px-3 py-2 font-semibold">SKU</th>
              <th className="px-3 py-2 font-semibold">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const product = Array.isArray(row.products) ? row.products[0] : row.products;
              const color = Array.isArray(row.colors) ? row.colors[0] : row.colors;
              const size = Array.isArray(row.sizes) ? row.sizes[0] : row.sizes;

              return (
                <tr className="border-t border-black/10" key={row.id}>
                  <td className="px-3 py-2">{product?.name ?? "-"}</td>
                  <td className="px-3 py-2">{color?.name ?? "-"}</td>
                  <td className="px-3 py-2">{size?.name ?? "-"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                  <td className="px-3 py-2 font-semibold">{row.stock_quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
