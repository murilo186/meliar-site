"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { applyOrderInventoryTransition } from "@/lib/orders/order-inventory";
import type { OrderStatus } from "@/types/order";

const allowedStatusValues: OrderStatus[] = [
  "pending",
  "approved",
  "paid",
  "delivered",
  "cancelled",
];

function isAllowedStatus(value: string): value is OrderStatus {
  return allowedStatusValues.includes(value as OrderStatus);
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") || "").trim();
  const nextStatusRaw = String(formData.get("nextStatus") || "").trim();

  if (!orderId || !isAllowedStatus(nextStatusRaw)) {
    return { ok: false, message: "Dados inválidos para atualização de status." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id,status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !orderData) {
    return { ok: false, message: "Pedido não encontrado para atualização." };
  }

  const previousStatus = orderData.status as OrderStatus;
  if (previousStatus !== nextStatusRaw) {
    try {
      await applyOrderInventoryTransition(supabase, orderId, nextStatusRaw);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a reserva de estoque deste pedido.";
      return { ok: false, message };
    }
  }

  const payload: {
    status: OrderStatus;
    approved_at?: string | null;
    cancelled_at?: string | null;
  } = {
    status: nextStatusRaw,
  };

  if (nextStatusRaw === "approved") {
    payload.approved_at = new Date().toISOString();
  }

  if (nextStatusRaw === "cancelled") {
    payload.cancelled_at = new Date().toISOString();
  }

  if (nextStatusRaw !== "cancelled") {
    payload.cancelled_at = null;
  }

  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  if (error) {
    return { ok: false, message: `Erro ao atualizar status: ${error.message}` };
  }

  revalidatePath("/admin/vendas");
  revalidatePath(`/admin/vendas/${orderId}`);
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
  revalidatePath("/perfil");
  revalidatePath(`/perfil/pedidos/${orderId}`);
  return { ok: true, message: "Status atualizado com sucesso." };
}
