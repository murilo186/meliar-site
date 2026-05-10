import Link from "next/link";
import { redirect } from "next/navigation";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { Button } from "@/components/ui/button";
import { getUserFavoriteProducts } from "@/lib/favorites/get-user-favorite-products";
import { formatCurrency } from "@/lib/format";
import { getCustomerOrderSummaries } from "@/lib/orders/get-customer-orders";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const orderStatusLabel = {
  pending: "Novo",
  approved: "Em atendimento",
  paid: "Confirmado",
  delivered: "Entregue",
  cancelled: "Cancelado",
} as const;

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,phone")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  const [orders, favoriteProducts] = await Promise.all([
    getCustomerOrderSummaries(user.id),
    getUserFavoriteProducts(user.id),
  ]);

  return (
    <section className="container py-6 sm:py-8">
      <header className="mb-5 border-b border-black/10 pb-4">
        <h1 className="text-xl font-bold text-black">Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {fullName || "Cliente"} • {user.email}
        </p>
      </header>

      <article className="mb-4 border border-black/10 bg-white p-4" id="favoritos">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-black">Favoritos</h2>
          <Button asChild className="h-8 rounded-none px-3" size="sm" variant="outline">
            <Link href="/produtos">Ver produtos</Link>
          </Button>
        </div>
        {favoriteProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não favoritou peças. Toque no coração de um produto para salvar aqui.
          </p>
        ) : (
          <CatalogGrid products={favoriteProducts} variant="editorial" />
        )}
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="border border-black/10 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-black">Pedidos</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Você ainda não tem pedidos registrados.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {orders.map((order) => (
                <li className="border border-black/10 p-3" key={order.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-black">{order.orderNumber}</p>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {orderStatusLabel[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.channel === "whatsapp" ? "WhatsApp" : "Manual"} •{" "}
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.itemsCount} {order.itemsCount === 1 ? "item" : "itens"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-black">
                    {formatCurrency(order.totalCents / 100)}
                  </p>
                  <div className="mt-3">
                    <Button asChild className="h-9 rounded-none px-4" size="sm" variant="outline">
                      <Link href={`/perfil/pedidos/${order.id}`}>Ver pedido</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="border border-black/10 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-black">
            Configurações básicas
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium text-black">{fullName || "Não informado"}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
              <dt className="text-muted-foreground">Telefone</dt>
              <dd className="font-medium text-black">{profile?.phone || "Não informado"}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">E-mail</dt>
              <dd className="font-medium text-black">{user.email}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
