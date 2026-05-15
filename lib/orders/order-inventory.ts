import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus } from "@/types/order";

const reservableStatuses: OrderStatus[] = ["pending", "approved", "paid"];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return null;
}

export function isReservableOrderStatus(status: OrderStatus) {
  return reservableStatuses.includes(status);
}

export async function reserveOrderInventory(
  supabase: SupabaseClient,
  orderId: string,
) {
  const { error } = await supabase.rpc("reserve_order_inventory", {
    p_order_id: orderId,
  });

  if (error) {
    const message = getErrorMessage(error);
    throw new Error(message ?? "Não foi possível reservar o estoque deste pedido.");
  }
}

export async function applyOrderInventoryTransition(
  supabase: SupabaseClient,
  orderId: string,
  nextStatus: OrderStatus,
) {
  const { error } = await supabase.rpc("apply_order_inventory_transition", {
    p_order_id: orderId,
    p_next_status: nextStatus,
  });

  if (error) {
    const message = getErrorMessage(error);
    throw new Error(
      message ?? "Não foi possível atualizar a reserva/baixa de estoque deste pedido.",
    );
  }
}
