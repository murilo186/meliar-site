import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return (
    <section className="container py-6 sm:py-8">
      <header className="mb-5 border-b border-black/10 pb-4">
        <h1 className="text-xl font-bold text-black">Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {fullName || "Cliente"} • {user.email}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="border border-black/10 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-black">Pedidos</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Você ainda não tem pedidos confirmados no site.
          </p>
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
