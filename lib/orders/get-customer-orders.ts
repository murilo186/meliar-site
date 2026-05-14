import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildOrderNumber } from "@/lib/orders/order-number";
import type { AdminSalesOrder } from "@/types/admin";
import type { OrderChannel, OrderStatus } from "@/types/order";

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  channel: OrderChannel;
  createdAt: string;
  totalCents: number;
  itemsCount: number;
}

export async function getCustomerOrderSummaries(userId: string): Promise<CustomerOrderSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("id,status,channel,created_at,total_cents")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    throw ordersError;
  }

  const orders = (ordersData ?? []) as Array<{
    id: string;
    status: OrderStatus;
    channel: OrderChannel;
    created_at: string;
    total_cents: number;
  }>;

  const orderIds = orders.map((order) => order.id);
  const itemsCountByOrderId = new Map<string, number>();

  if (orderIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("order_items")
      .select("order_id")
      .in("order_id", orderIds);

    for (const row of itemsData ?? []) {
      const orderId = String(row.order_id);
      itemsCountByOrderId.set(orderId, (itemsCountByOrderId.get(orderId) ?? 0) + 1);
    }
  }

  return orders.map((order) => ({
    id: order.id,
    orderNumber: buildOrderNumber(order.id),
    status: order.status,
    channel: order.channel,
    createdAt: order.created_at,
    totalCents: order.total_cents,
    itemsCount: itemsCountByOrderId.get(order.id) ?? 0,
  }));
}

type CustomerOrderRow = {
  id: string;
  customer_id: string | null;
  status: OrderStatus;
  channel: OrderChannel;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  created_at: string;
  total_cents: number;
  notes: string | null;
};

type OrderItemRow = {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
};

type VariantRow = {
  id: string;
  product_id: string;
  color_id: string;
  size_id: string;
};

type ProductRow = { id: string; name: string };
type ColorRow = { id: string; name: string };
type SizeRow = { id: string; name: string };
type ProductImageRow = {
  product_id: string;
  color_id: string | null;
  image_url: string;
  sort_order: number;
};

const IMAGE_FALLBACK = "";

export async function getCustomerOrderById(
  userId: string,
  orderId: string,
): Promise<AdminSalesOrder | null> {
  const supabase = await createSupabaseServerClient();
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id,customer_id,status,channel,customer_name,customer_phone,customer_email,created_at,total_cents,notes")
    .eq("id", orderId)
    .eq("customer_id", userId)
    .maybeSingle();

  if (orderError) {
    throw orderError;
  }

  if (!orderData) {
    return null;
  }

  const order = orderData as CustomerOrderRow;
  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select("id,variant_id,quantity,unit_price_cents,subtotal_cents")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw itemsError;
  }

  const items = (itemsData ?? []) as OrderItemRow[];
  const variantIds = Array.from(new Set(items.map((item) => item.variant_id)));

  if (variantIds.length === 0) {
    return {
      id: order.id,
      orderNumber: buildOrderNumber(order.id),
      status: order.status,
      channel: order.channel,
      customerName: order.customer_name?.trim() || "Cliente",
      customerPhone: order.customer_phone?.trim() || "Não informado",
      customerEmail: order.customer_email ?? undefined,
      createdAt: order.created_at,
      totalCents: order.total_cents,
      notes: order.notes ?? undefined,
      items: [],
    };
  }

  const { data: variantsData, error: variantsError } = await supabase
    .from("product_variants")
    .select("id,product_id,color_id,size_id")
    .in("id", variantIds);

  if (variantsError) {
    throw variantsError;
  }

  const variants = (variantsData ?? []) as VariantRow[];
  const variantsById = new Map(variants.map((variant) => [variant.id, variant] as const));
  const productIds = Array.from(new Set(variants.map((item) => item.product_id)));
  const colorIds = Array.from(new Set(variants.map((item) => item.color_id)));
  const sizeIds = Array.from(new Set(variants.map((item) => item.size_id)));

  const [{ data: productsData }, { data: colorsData }, { data: sizesData }, { data: imagesData }] =
    await Promise.all([
      supabase.from("products").select("id,name").in("id", productIds),
      supabase.from("colors").select("id,name").in("id", colorIds),
      supabase.from("sizes").select("id,name").in("id", sizeIds),
      supabase
        .from("product_images")
        .select("product_id,color_id,image_url,sort_order")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true }),
    ]);

  const products = new Map(
    ((productsData ?? []) as ProductRow[]).map((row) => [row.id, row] as const),
  );
  const colors = new Map(
    ((colorsData ?? []) as ColorRow[]).map((row) => [row.id, row] as const),
  );
  const sizes = new Map(
    ((sizesData ?? []) as SizeRow[]).map((row) => [row.id, row] as const),
  );

  const imagesByProductColor = new Map<string, string[]>();
  const imagesByProductFallback = new Map<string, string[]>();

  for (const row of (imagesData ?? []) as ProductImageRow[]) {
    if (row.color_id) {
      const key = `${row.product_id}:${row.color_id}`;
      const current = imagesByProductColor.get(key) ?? [];
      current.push(row.image_url);
      imagesByProductColor.set(key, current);
    }

    const fallback = imagesByProductFallback.get(row.product_id) ?? [];
    fallback.push(row.image_url);
    imagesByProductFallback.set(row.product_id, fallback);
  }

  return {
    id: order.id,
    orderNumber: buildOrderNumber(order.id),
    status: order.status,
    channel: order.channel,
    customerName: order.customer_name?.trim() || "Cliente",
    customerPhone: order.customer_phone?.trim() || "Não informado",
    customerEmail: order.customer_email ?? undefined,
    createdAt: order.created_at,
    totalCents: order.total_cents,
    notes: order.notes ?? undefined,
    items: items.map((item) => {
      const variant = variantsById.get(item.variant_id);
      const product = variant ? products.get(variant.product_id) : null;
      const color = variant ? colors.get(variant.color_id) : null;
      const size = variant ? sizes.get(variant.size_id) : null;
      const productName = product?.name ?? "Peça sem cadastro";
      const variantLabel = `${color?.name ?? "Cor"} • ${size?.name ?? "Tam."}`;
      const imageByColor = variant
        ? imagesByProductColor.get(`${variant.product_id}:${variant.color_id}`) ?? []
        : [];
      const imageByProduct = variant
        ? imagesByProductFallback.get(variant.product_id) ?? []
        : [];

      return {
        id: item.id,
        productName,
        variantLabel,
        imageUrl: imageByColor[0] || imageByProduct[0] || IMAGE_FALLBACK,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        subtotalCents: item.subtotal_cents,
      };
    }),
  };
}
