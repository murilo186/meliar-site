import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { buildOrderNumber } from "@/lib/orders/order-number";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";
import { storeConfig } from "@/config/store";
import type { CartItem } from "@/types/cart";

type ProductRow = { id: string; slug: string };
type ColorRow = { id: string; name: string };
type SizeRow = { id: string; name: string };
type VariantRow = { id: string; product_id: string; color_id: string; size_id: string };

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(phone?: string | null) {
  return phone ? phone.replace(/\D/g, "") : null;
}

export async function createWhatsAppOrder(items: CartItem[]) {
  if (items.length === 0) {
    throw new Error("Sua sacola está vazia.");
  }

  const serverClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  const serviceClient = createSupabaseServiceClient();

  const slugs = Array.from(new Set(items.map((item) => item.selection.productSlug)));
  const rawColorNames = Array.from(
    new Set(items.map((item) => item.selection.color.trim())),
  );
  const rawSizeNames = Array.from(
    new Set(items.map((item) => item.selection.size.trim())),
  );

  const [{ data: productsData, error: productsError }, { data: colorsData, error: colorsError }, { data: sizesData, error: sizesError }] =
    await Promise.all([
      serviceClient.from("products").select("id,slug").in("slug", slugs),
      serviceClient.from("colors").select("id,name").in("name", rawColorNames),
      serviceClient.from("sizes").select("id,name").in("name", rawSizeNames),
    ]);

  if (productsError || colorsError || sizesError) {
    throw new Error("Não foi possível validar os itens do pedido.");
  }

  const products = (productsData ?? []) as ProductRow[];
  const colors = (colorsData ?? []) as ColorRow[];
  const sizes = (sizesData ?? []) as SizeRow[];

  const productIdBySlug = new Map(products.map((row) => [row.slug, row.id] as const));
  const colorIdByName = new Map(
    colors.map((row) => [normalizeText(row.name), row.id] as const),
  );
  const sizeIdByName = new Map(
    sizes.map((row) => [normalizeText(row.name), row.id] as const),
  );

  const productIds = Array.from(new Set(products.map((row) => row.id)));
  const colorIds = Array.from(new Set(colors.map((row) => row.id)));
  const sizeIds = Array.from(new Set(sizes.map((row) => row.id)));

  if (productIds.length === 0 || colorIds.length === 0 || sizeIds.length === 0) {
    throw new Error("Não foi possível validar os itens da sacola.");
  }

  const { data: variantsData, error: variantsError } = await serviceClient
    .from("product_variants")
    .select("id,product_id,color_id,size_id")
    .in("product_id", productIds)
    .in("color_id", colorIds)
    .in("size_id", sizeIds);

  if (variantsError) {
    throw new Error("Não foi possível validar variantes do pedido.");
  }

  const variants = (variantsData ?? []) as VariantRow[];
  const variantByKey = new Map(
    variants.map((row) => [`${row.product_id}:${row.color_id}:${row.size_id}`, row.id] as const),
  );

  const subtotalCents = items.reduce((sum, item) => {
    return sum + Math.round(item.selection.price * 100) * item.quantity;
  }, 0);

  let customerName: string | null = null;
  let customerPhone: string | null = null;
  let customerEmail: string | null = user?.email ?? null;

  if (user) {
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("first_name,last_name,phone")
      .eq("id", user.id)
      .maybeSingle();

    const profileName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    customerName = profileName || user.email || null;
    customerPhone = normalizePhone(profile?.phone);
    customerEmail = user.email ?? null;
  }

  const { data: orderData, error: orderError } = await serviceClient
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      channel: "whatsapp",
      status: "pending",
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      notes: "Pedido iniciado pelo checkout WhatsApp da loja.",
      subtotal_cents: subtotalCents,
      total_cents: subtotalCents,
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    throw new Error("Não foi possível criar o pedido.");
  }

  const orderId = orderData.id as string;
  let orderItems;
  try {
    orderItems = items.map((item) => {
      const productId = productIdBySlug.get(item.selection.productSlug);
      const colorId = colorIdByName.get(normalizeText(item.selection.color));
      const sizeId = sizeIdByName.get(normalizeText(item.selection.size));

      if (!productId || !colorId || !sizeId) {
        throw new Error(
          `Não foi possível identificar variante para ${item.selection.name}.`,
        );
      }

      const variantId = variantByKey.get(`${productId}:${colorId}:${sizeId}`);

      if (!variantId) {
        throw new Error(
          `Variante indisponível para ${item.selection.name} (${item.selection.color} / ${item.selection.size}).`,
        );
      }

      const unitPriceCents = Math.round(item.selection.price * 100);

      return {
        order_id: orderId,
        variant_id: variantId,
        quantity: item.quantity,
        unit_price_cents: unitPriceCents,
        subtotal_cents: unitPriceCents * item.quantity,
      };
    });
  } catch (error) {
    await serviceClient.from("orders").delete().eq("id", orderId);
    throw error;
  }

  const { error: itemsError } = await serviceClient
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    await serviceClient.from("orders").delete().eq("id", orderId);
    throw new Error("Pedido criado, mas houve erro ao registrar os itens.");
  }

  const orderNumber = buildOrderNumber(orderId);
  const whatsappUrl = buildWhatsAppUrl(storeConfig.whatsappNumber, items, orderNumber);

  return {
    orderId,
    orderNumber,
    whatsappUrl,
  };
}
