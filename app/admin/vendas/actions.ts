"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { OrderStatus } from "@/types/order";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["approved", "cancelled"],
  approved: ["paid", "cancelled"],
  paid: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

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
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: currentOrder } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  const currentStatus = currentOrder?.status as OrderStatus | undefined;

  if (!currentStatus || !allowedTransitions[currentStatus].includes(nextStatusRaw)) {
    return;
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
    return;
  }

  revalidatePath("/admin/vendas");
  revalidatePath(`/admin/vendas/${orderId}`);
  revalidatePath("/perfil");
}
