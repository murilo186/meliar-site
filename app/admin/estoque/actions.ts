"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getRedirectTarget(formData: FormData, fallbackPath: string) {
  const redirectTo = String(formData.get("redirectTo") || "").trim();
  if (!redirectTo) return fallbackPath;
  if (!redirectTo.startsWith("/admin")) return fallbackPath;
  return redirectTo;
}

function redirectWithNotice(path: string, ok: boolean, message: string): never {
  const params = new URLSearchParams({
    status: ok ? "success" : "error",
    message,
  });
  return redirect(`${path}?${params.toString()}`);
}

export async function updateStockFromStockPageAction(formData: FormData) {
  await requireAdmin();

  const variantId = String(formData.get("variantId") || "").trim();
  const stockQuantity = Number(String(formData.get("stockQuantity") || "0"));
  const isAvailable = formData.get("isAvailable") === "on";
  const redirectTo = getRedirectTarget(formData, "/admin/estoque");

  if (!variantId || !Number.isFinite(stockQuantity) || stockQuantity < 0) {
    redirectWithNotice(redirectTo, false, "Dados inválidos para atualização de estoque.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_variants")
    .update({
      stock_quantity: stockQuantity,
      is_available: isAvailable,
    })
    .eq("id", variantId);

  if (error) {
    redirectWithNotice(redirectTo, false, `Erro ao atualizar estoque: ${error.message}`);
  }

  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
  redirectWithNotice(redirectTo, true, "Estoque atualizado.");
}
