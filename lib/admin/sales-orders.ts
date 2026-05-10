import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildOrderNumber } from "@/lib/orders/order-number";
import type { AdminSalesOrder, AdminSalesOrderSummary, AdminSalesStatus } from "@/types/admin";

type OrderRow = {
  id: string;
  status: AdminSalesStatus;
  channel: "whatsapp" | "manual";
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

const IMAGE_FALLBACK = "/mock/product-shirt.svg";

export interface AdminSalesCounters {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  delivered: number;
  cancelled: number;
}

export interface AdminSalesSummariesPage {
  rows: AdminSalesOrderSummary[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  counters: AdminSalesCounters;
}

interface AdminSalesSummariesQuery {
  page: number;
  pageSize: number;
  query?: string;
  status?: AdminSalesStatus | "all";
}

function resolveCustomerName(order: OrderRow) {
  return order.customer_name?.trim() || "Cliente";
}

function resolveCustomerPhone(order: OrderRow) {
  return order.customer_phone?.trim() || "Não informado";
}

function sanitizeSearchInput(raw?: string) {
  return (raw ?? "")
    .trim()
    .slice(0, 80)
    .replace(/[",.:()\\]/g, " ");
}

function escapeIlikePattern(raw: string) {
  return raw.replace(/[%_]/g, " ");
}

function toCounterNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }

  return 0;
}

async function getOrdersCounters(): Promise<AdminSalesCounters> {
  const supabase = await createSupabaseServerClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc("admin_orders_counters");

  if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
    const row = rpcData[0] as Record<string, unknown>;

    return {
      total: toCounterNumber(row.total),
      pending: toCounterNumber(row.pending),
      approved: toCounterNumber(row.approved),
      paid: toCounterNumber(row.paid),
      delivered: toCounterNumber(row.delivered),
      cancelled: toCounterNumber(row.cancelled),
    };
  }

  const fetchCount = async (status?: AdminSalesStatus) => {
    let query = supabase.from("orders").select("id", { count: "exact", head: true });
    if (status) {
      query = query.eq("status", status);
    }

    const { count, error } = await query;
    if (error) {
      throw error;
    }

    return count ?? 0;
  };

  const [total, pending, approved, paid, delivered, cancelled] = await Promise.all([
    fetchCount(),
    fetchCount("pending"),
    fetchCount("approved"),
    fetchCount("paid"),
    fetchCount("delivered"),
    fetchCount("cancelled"),
  ]);

  return {
    total,
    pending,
    approved,
    paid,
    delivered,
    cancelled,
  };
}

export async function getAdminSalesSummariesPageFromDb({
  page,
  pageSize,
  query,
  status = "all",
}: AdminSalesSummariesQuery): Promise<AdminSalesSummariesPage> {
  const supabase = await createSupabaseServerClient();
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Math.min(Math.max(Math.floor(pageSize), 1), 30);
  const search = sanitizeSearchInput(query);

  const buildRowsQuery = ({ withCount }: { withCount: boolean }) => {
    let queryBuilder = supabase
      .from("orders")
      .select("id,status,channel,customer_name,customer_phone,created_at,total_cents", {
        ...(withCount ? { count: "exact" as const } : {}),
      })
      .order("created_at", { ascending: false });

    if (status !== "all") {
      queryBuilder = queryBuilder.eq("status", status);
    }

    if (search) {
      const pattern = `%${escapeIlikePattern(search)}%`;
      queryBuilder = queryBuilder.or(
        `customer_name.ilike.${pattern},customer_phone.ilike.${pattern},customer_email.ilike.${pattern}`,
      );
    }

    return queryBuilder;
  };

  const from = (currentPage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const [{ data, error, count }, counters] = await Promise.all([
    buildRowsQuery({ withCount: true }).range(from, to),
    getOrdersCounters(),
  ]);

  if (error) {
    throw error;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(currentPage, totalPages);
  let orders = (data ?? []) as Array<
    Omit<OrderRow, "customer_email" | "notes"> & {
      customer_email?: string | null;
      notes?: string | null;
    }
  >;

  if (safePage !== currentPage && total > 0) {
    const safeFrom = (safePage - 1) * safePageSize;
    const safeTo = safeFrom + safePageSize - 1;
    const { data: safeData, error: safeError } = await buildRowsQuery({
      withCount: false,
    }).range(safeFrom, safeTo);

    if (safeError) {
      throw safeError;
    }

    orders = (safeData ?? []) as Array<
      Omit<OrderRow, "customer_email" | "notes"> & {
        customer_email?: string | null;
        notes?: string | null;
      }
    >;
  }

  const orderIds = orders.map((order) => order.id);
  const itemsCountByOrderId = new Map<string, number>();

  if (orderIds.length > 0) {
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id")
      .in("order_id", orderIds);

    if (itemsError) {
      throw itemsError;
    }

    for (const row of itemsData ?? []) {
      const orderId = String(row.order_id);
      itemsCountByOrderId.set(orderId, (itemsCountByOrderId.get(orderId) ?? 0) + 1);
    }
  }

  return {
    rows: orders.map((order) => ({
      id: order.id,
      orderNumber: buildOrderNumber(order.id),
      status: order.status,
      channel: order.channel,
      customerName: resolveCustomerName(order as OrderRow),
      customerPhone: resolveCustomerPhone(order as OrderRow),
      createdAt: order.created_at,
      totalCents: order.total_cents,
      itemsCount: itemsCountByOrderId.get(order.id) ?? 0,
    })),
    total,
    totalPages,
    page: safePage,
    pageSize: safePageSize,
    counters,
  };
}

export async function getAdminSalesSummariesFromDb(): Promise<AdminSalesOrderSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id,status,channel,customer_name,customer_phone,created_at,total_cents")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const orders = (data ?? []) as Array<
    Omit<OrderRow, "customer_email" | "notes"> & {
      customer_email?: string | null;
      notes?: string | null;
    }
  >;

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
    customerName: resolveCustomerName(order as OrderRow),
    customerPhone: resolveCustomerPhone(order as OrderRow),
    createdAt: order.created_at,
    totalCents: order.total_cents,
    itemsCount: itemsCountByOrderId.get(order.id) ?? 0,
  }));
}

export async function getAdminSalesOrderByIdFromDb(orderId: string): Promise<AdminSalesOrder | null> {
  const supabase = await createSupabaseServerClient();
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id,status,channel,customer_name,customer_phone,customer_email,created_at,total_cents,notes")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw orderError;
  }

  if (!orderData) {
    return null;
  }

  const order = orderData as OrderRow;
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
      customerName: resolveCustomerName(order),
      customerPhone: resolveCustomerPhone(order),
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
    customerName: resolveCustomerName(order),
    customerPhone: resolveCustomerPhone(order),
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
