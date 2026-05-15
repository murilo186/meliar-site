import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { CartItem, CartProductSelection } from "@/types/cart";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  is_visible: boolean;
};

type ColorRow = { id: string; name: string };
type SizeRow = { id: string; name: string };
type VariantRow = {
  id: string;
  product_id: string;
  color_id: string;
  size_id: string;
  stock_quantity: number;
  reserved_quantity: number;
  is_available: boolean;
  price_cents: number | null;
};

export type CheckoutIssueCode =
  | "invalid-item"
  | "product-not-found"
  | "variant-not-found"
  | "out-of-stock"
  | "insufficient-stock"
  | "invalid-pricing";

export interface CheckoutValidationIssue {
  selectionId: string;
  productSlug: string;
  productName: string;
  color: string;
  size: string;
  requestedQuantity: number;
  availableQuantity: number;
  code: CheckoutIssueCode;
  message: string;
}

export interface CheckoutValidatedItem {
  selection: CartProductSelection;
  quantity: number;
  variantId: string;
  availableQuantity: number;
  unitPriceCents: number;
  lineSubtotalCents: number;
  priceChanged: boolean;
}

export interface CheckoutValidationResult {
  items: CheckoutValidatedItem[];
  issues: CheckoutValidationIssue[];
  hasBlockingIssues: boolean;
  hasPriceChanges: boolean;
  subtotalCents: number;
  totalCents: number;
}

type ParsedCartItem = {
  selection: CartProductSelection;
  quantity: number;
};

type ResolvedCartItem = ParsedCartItem & {
  product: ProductRow;
  colorId: string;
  colorName: string;
  sizeId: string;
  sizeName: string;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function toSelectionId(selection?: Partial<CartProductSelection>) {
  if (selection?.id && selection.id.trim()) {
    return selection.id.trim();
  }

  return `${selection?.productSlug ?? "item"}:${selection?.color ?? "cor"}:${selection?.size ?? "tam"}`;
}

function toIssueBase(item?: ParsedCartItem): Omit<CheckoutValidationIssue, "code" | "message"> {
  return {
    selectionId: toSelectionId(item?.selection),
    productSlug: item?.selection.productSlug ?? "",
    productName: item?.selection.name ?? "Produto",
    color: item?.selection.color ?? "Cor",
    size: item?.selection.size ?? "Tamanho",
    requestedQuantity: item?.quantity ?? 0,
    availableQuantity: 0,
  };
}

function toMoney(cents: number) {
  return cents / 100;
}

function sanitizeQuantity(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const intValue = Math.floor(parsed);
  if (intValue <= 0) return null;
  return intValue;
}

export class CheckoutValidationError extends Error {
  status: number;
  issues: CheckoutValidationIssue[];

  constructor(message: string, status = 400, issues: CheckoutValidationIssue[] = []) {
    super(message);
    this.name = "CheckoutValidationError";
    this.status = status;
    this.issues = issues;
  }
}

export function formatCheckoutIssuesMessage(issues: CheckoutValidationIssue[]) {
  if (issues.length === 0) {
    return "Alguns itens da sacola precisam ser revisados.";
  }

  const firstIssue = issues[0];
  if (issues.length === 1) {
    return firstIssue.message;
  }

  return `${firstIssue.message} Existem mais itens para revisar na sacola.`;
}

export async function validateCheckoutCartItems(items: CartItem[]): Promise<CheckoutValidationResult> {
  const issues: CheckoutValidationIssue[] = [];
  const parsedItems: ParsedCartItem[] = [];

  if (!Array.isArray(items) || items.length === 0) {
    return {
      items: [],
      issues: [
        {
          selectionId: "sacola-vazia",
          productSlug: "",
          productName: "Sacola",
          color: "-",
          size: "-",
          requestedQuantity: 0,
          availableQuantity: 0,
          code: "invalid-item",
          message: "Adicione itens à sacola para continuar.",
        },
      ],
      hasBlockingIssues: true,
      hasPriceChanges: false,
      subtotalCents: 0,
      totalCents: 0,
    };
  }

  for (const item of items) {
    const selection = item?.selection;
    const quantity = sanitizeQuantity(item?.quantity);
    const hasRequiredFields = Boolean(
      selection?.id &&
        selection.productSlug &&
        selection.name &&
        selection.color &&
        selection.size,
    );

    if (!hasRequiredFields || quantity == null) {
      const fallbackItem: ParsedCartItem | undefined =
        selection && quantity != null ? { selection, quantity } : undefined;
      issues.push({
        ...toIssueBase(fallbackItem),
        code: "invalid-item",
        message: "Há um item inválido na sacola. Remova e adicione novamente.",
      });
      continue;
    }

    parsedItems.push({ selection, quantity });
  }

  if (parsedItems.length === 0) {
    return {
      items: [],
      issues,
      hasBlockingIssues: true,
      hasPriceChanges: false,
      subtotalCents: 0,
      totalCents: 0,
    };
  }

  const serviceClient = createSupabaseServiceClient();

  const slugs = Array.from(new Set(parsedItems.map((item) => item.selection.productSlug)));
  const [{ data: productsData, error: productsError }, { data: colorsData, error: colorsError }, { data: sizesData, error: sizesError }] =
    await Promise.all([
      serviceClient
        .from("products")
        .select("id,slug,name,price_cents,is_visible")
        .in("slug", slugs),
      serviceClient.from("colors").select("id,name"),
      serviceClient.from("sizes").select("id,name"),
    ]);

  if (productsError || colorsError || sizesError) {
    throw new Error("Não foi possível validar os itens da sacola no momento.");
  }

  const products = (productsData ?? []) as ProductRow[];
  const colors = (colorsData ?? []) as ColorRow[];
  const sizes = (sizesData ?? []) as SizeRow[];

  const productBySlug = new Map(products.map((row) => [row.slug, row] as const));
  const colorByNormalizedName = new Map(
    colors.map((row) => [normalizeText(row.name), row] as const),
  );
  const sizeByNormalizedName = new Map(
    sizes.map((row) => [normalizeText(row.name), row] as const),
  );

  const resolvedItems: ResolvedCartItem[] = [];
  for (const item of parsedItems) {
    const product = productBySlug.get(item.selection.productSlug);
    if (!product || !product.is_visible) {
      issues.push({
        ...toIssueBase(item),
        code: "product-not-found",
        message: `${item.selection.name} não está mais disponível na loja.`,
      });
      continue;
    }

    const color = colorByNormalizedName.get(normalizeText(item.selection.color));
    const size = sizeByNormalizedName.get(normalizeText(item.selection.size));
    if (!color || !size) {
      issues.push({
        ...toIssueBase(item),
        code: "variant-not-found",
        message: `A variação de ${item.selection.name} (${item.selection.color} / ${item.selection.size}) não foi encontrada.`,
      });
      continue;
    }

    resolvedItems.push({
      ...item,
      product,
      colorId: color.id,
      colorName: color.name,
      sizeId: size.id,
      sizeName: size.name,
    });
  }

  if (resolvedItems.length === 0) {
    return {
      items: [],
      issues,
      hasBlockingIssues: true,
      hasPriceChanges: false,
      subtotalCents: 0,
      totalCents: 0,
    };
  }

  const productIds = Array.from(new Set(resolvedItems.map((item) => item.product.id)));
  const colorIds = Array.from(new Set(resolvedItems.map((item) => item.colorId)));
  const sizeIds = Array.from(new Set(resolvedItems.map((item) => item.sizeId)));

  const { data: variantsData, error: variantsError } = await serviceClient
    .from("product_variants")
    .select("id,product_id,color_id,size_id,stock_quantity,reserved_quantity,is_available,price_cents")
    .in("product_id", productIds)
    .in("color_id", colorIds)
    .in("size_id", sizeIds);

  if (variantsError) {
    throw new Error("Não foi possível validar o estoque da sacola no momento.");
  }

  const variants = (variantsData ?? []) as VariantRow[];
  const variantByKey = new Map(
    variants.map((row) => [`${row.product_id}:${row.color_id}:${row.size_id}`, row] as const),
  );

  const validatedItems: CheckoutValidatedItem[] = [];

  for (const item of resolvedItems) {
    const variant = variantByKey.get(
      `${item.product.id}:${item.colorId}:${item.sizeId}`,
    );

    if (!variant) {
      issues.push({
        ...toIssueBase(item),
        code: "variant-not-found",
        message: `A variação de ${item.selection.name} (${item.colorName} / ${item.sizeName}) não está mais disponível.`,
      });
      continue;
    }

    const availableQuantity = variant.is_available
      ? Math.max(0, variant.stock_quantity - variant.reserved_quantity)
      : 0;

    if (availableQuantity <= 0) {
      issues.push({
        ...toIssueBase(item),
        availableQuantity,
        code: "out-of-stock",
        message: `${item.selection.name} (${item.colorName} / ${item.sizeName}) está sem estoque no momento.`,
      });
      continue;
    }

    if (item.quantity > availableQuantity) {
      issues.push({
        ...toIssueBase(item),
        availableQuantity,
        code: "insufficient-stock",
        message: `${item.selection.name} (${item.colorName} / ${item.sizeName}) tem apenas ${availableQuantity} unidade(s) disponível(is).`,
      });
      continue;
    }

    const unitPriceCents = variant.price_cents ?? item.product.price_cents;
    if (!Number.isFinite(unitPriceCents) || unitPriceCents <= 0) {
      issues.push({
        ...toIssueBase(item),
        availableQuantity,
        code: "invalid-pricing",
        message: `Não foi possível validar o preço de ${item.selection.name}.`,
      });
      continue;
    }

    const serverPrice = toMoney(unitPriceCents);
    const clientPriceCents = Math.round(item.selection.price * 100);
    const priceChanged = clientPriceCents !== unitPriceCents;

    validatedItems.push({
      selection: {
        ...item.selection,
        name: item.product.name,
        color: item.colorName,
        size: item.sizeName,
        price: serverPrice,
      },
      quantity: item.quantity,
      variantId: variant.id,
      availableQuantity,
      unitPriceCents,
      lineSubtotalCents: unitPriceCents * item.quantity,
      priceChanged,
    });
  }

  const subtotalCents = validatedItems.reduce(
    (sum, item) => sum + item.lineSubtotalCents,
    0,
  );
  const hasPriceChanges = validatedItems.some((item) => item.priceChanged);

  return {
    items: validatedItems,
    issues,
    hasBlockingIssues: issues.length > 0,
    hasPriceChanges,
    subtotalCents,
    totalCents: subtotalCents,
  };
}
