import { storeConfig } from "@/config/store";
import {
  CheckoutValidationError,
  formatCheckoutIssuesMessage,
  validateCheckoutCartItems,
} from "@/lib/orders/checkout-validation";
import { reserveOrderInventory } from "@/lib/orders/order-inventory";
import { buildOrderNumber } from "@/lib/orders/order-number";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";
import type { CartItem } from "@/types/cart";

function normalizePhone(phone?: string | null) {
  return phone ? phone.replace(/\D/g, "") : null;
}

export async function createWhatsAppOrder(items: CartItem[]) {
  if (items.length === 0) {
    throw new CheckoutValidationError("Sua sacola está vazia.", 400);
  }

  const serverClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    throw new CheckoutValidationError(
      "Faça login para finalizar seu pedido no WhatsApp.",
      401,
    );
  }

  const validation = await validateCheckoutCartItems(items);
  if (validation.hasBlockingIssues) {
    throw new CheckoutValidationError(
      formatCheckoutIssuesMessage(validation.issues),
      409,
      validation.issues,
    );
  }

  const serviceClient = createSupabaseServiceClient();

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("first_name,last_name,phone")
    .eq("id", user.id)
    .maybeSingle();

  const profileName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const customerName = profileName || user.email || null;
  const customerPhone = normalizePhone(profile?.phone);
  const customerEmail = user.email ?? null;

  const { data: orderData, error: orderError } = await serviceClient
    .from("orders")
    .insert({
      customer_id: user.id,
      channel: "whatsapp",
      status: "pending",
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      notes: "Pedido iniciado pelo checkout WhatsApp da loja.",
      subtotal_cents: validation.subtotalCents,
      total_cents: validation.totalCents,
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    throw new Error("Não foi possível criar o pedido.");
  }

  const orderId = orderData.id as string;
  const orderItems = validation.items.map((item) => ({
    order_id: orderId,
    variant_id: item.variantId,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    subtotal_cents: item.lineSubtotalCents,
  }));

  const { error: itemsError } = await serviceClient
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    await serviceClient.from("orders").delete().eq("id", orderId);
    throw new Error("Pedido criado, mas houve erro ao registrar os itens.");
  }

  try {
    await reserveOrderInventory(serviceClient, orderId);
  } catch (error) {
    await serviceClient.from("orders").delete().eq("id", orderId);
    const message =
      error instanceof Error ? error.message : "Não foi possível reservar o estoque agora.";
    throw new CheckoutValidationError(message, 409);
  }

  const orderNumber = buildOrderNumber(orderId);
  const normalizedCartItems: CartItem[] = validation.items.map((item) => ({
    selection: item.selection,
    quantity: item.quantity,
  }));
  const whatsappUrl = buildWhatsAppUrl(
    storeConfig.whatsappNumber,
    normalizedCartItems,
    orderNumber,
  );

  return {
    orderId,
    orderNumber,
    whatsappUrl,
  };
}
