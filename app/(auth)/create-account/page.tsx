import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { CreateAccountForm } from "@/components/auth/create-account-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CreateAccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    redirect(profile?.role === "admin" ? "/admin" : "/");
  }

  return (
    <AuthShell title="Criar conta">
      <CreateAccountForm />
    </AuthShell>
  );
}
