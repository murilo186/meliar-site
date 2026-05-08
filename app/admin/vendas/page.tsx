import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

type OrderRow = {
  id: string;
  status: "pending" | "approved" | "paid" | "cancelled" | "delivered";
  customer_name: string | null;
  customer_phone: string | null;
  total_cents: number;
  created_at: string;
};

export default async function AdminSalesPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: orders }, { count: pendingCount }, { count: paidCount }] = await Promise.all([
    supabase
      .from("orders")
      .select("id,status,customer_name,customer_phone,total_cents,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
  ]);

  const rows = (orders ?? []) as OrderRow[];

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold">Vendas</h2>
        <p className="text-sm text-muted-foreground">
          Pendentes: {pendingCount ?? 0} • Pagas: {paidCount ?? 0}
        </p>
      </header>

      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#ffe4ec] text-left">
            <tr>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Cliente</th>
              <th className="px-3 py-2 font-semibold">Telefone</th>
              <th className="px-3 py-2 font-semibold">Total</th>
              <th className="px-3 py-2 font-semibold">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-black/10" key={row.id}>
                <td className="px-3 py-2 uppercase">{row.status}</td>
                <td className="px-3 py-2">{row.customer_name || "-"}</td>
                <td className="px-3 py-2">{row.customer_phone || "-"}</td>
                <td className="px-3 py-2 font-semibold">
                  {formatCurrency(row.total_cents / 100)}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
