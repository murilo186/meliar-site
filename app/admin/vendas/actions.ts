"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
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
  const isTransitioningToPaid = nextStatusRaw === "paid" && previousStatus !== "paid";

  if (isTransitioningToPaid) {
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from("order_items")
      .select("variant_id,quantity")
      .eq("order_id", orderId);

    if (orderItemsError) {
      return { ok: false, message: `Erro ao ler itens do pedido: ${orderItemsError.message}` };
    }

    const rawItems = (orderItemsData ?? []) as Array<{ variant_id: string; quantity: number }>;
    if (rawItems.length === 0) {
      return { ok: false, message: "Este pedido não possui itens para confirmação." };
    }

    const requiredByVariantId = new Map<string, number>();
    for (const item of rawItems) {
      if (!item.variant_id || !Number.isFinite(item.quantity) || item.quantity <= 0) continue;
      requiredByVariantId.set(
        item.variant_id,
        (requiredByVariantId.get(item.variant_id) ?? 0) + item.quantity,
      );
    }

    const variantIds = Array.from(requiredByVariantId.keys());
    if (variantIds.length === 0) {
      return { ok: false, message: "Itens do pedido inválidos para confirmação." };
    }

    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("id,stock_quantity,is_available")
      .in("id", variantIds);

    if (variantsError) {
      return { ok: false, message: `Erro ao validar estoque: ${variantsError.message}` };
    }

    const variants = (variantsData ?? []) as Array<{
      id: string;
      stock_quantity: number;
      is_available: boolean;
    }>;
    const variantsById = new Map(variants.map((variant) => [variant.id, variant] as const));

    for (const [variantId, requiredQty] of requiredByVariantId.entries()) {
      const variant = variantsById.get(variantId);
      if (!variant) {
        return {
          ok: false,
          message: "Não foi possível confirmar: uma variante do pedido não existe mais.",
        };
      }

      if (!variant.is_available || variant.stock_quantity < requiredQty) {
        return {
          ok: false,
          message:
            "Não foi possível confirmar: um ou mais itens estão sem estoque suficiente. Atualize o estoque e tente novamente.",
        };
      }
    }

    const decremented: Array<{ variantId: string; quantity: number }> = [];
    for (const [variantId, requiredQty] of requiredByVariantId.entries()) {
      const { data: updatedRows, error: updateStockError } = await supabase
        .from("product_variants")
        .update({
          stock_quantity: Math.max(
            0,
            (variantsById.get(variantId)?.stock_quantity ?? 0) - requiredQty,
          ),
        })
        .eq("id", variantId)
        .gte("stock_quantity", requiredQty)
        .eq("is_available", true)
        .select("id");

      if (updateStockError || !updatedRows || updatedRows.length === 0) {
        for (const rollback of decremented) {
          const previousStock = variantsById.get(rollback.variantId)?.stock_quantity ?? 0;
          await supabase
            .from("product_variants")
            .update({ stock_quantity: previousStock })
            .eq("id", rollback.variantId);
        }

        return {
          ok: false,
          message:
            "Não foi possível confirmar: o estoque mudou durante a confirmação. Recarregue e tente novamente.",
        };
      }

      decremented.push({ variantId, quantity: requiredQty });
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
