import { NextResponse } from "next/server";
import { validateCheckoutCartItems } from "@/lib/orders/checkout-validation";
import type { CartItem } from "@/types/cart";

interface ValidateCheckoutPayload {
  items?: CartItem[];
}

export async function POST(request: Request) {
  let payload: ValidateCheckoutPayload | null = null;

  try {
    payload = (await request.json()) as ValidateCheckoutPayload;
  } catch {
    return NextResponse.json(
      { message: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const items = payload?.items ?? [];
  const validation = await validateCheckoutCartItems(items);

  return NextResponse.json({
    hasBlockingIssues: validation.hasBlockingIssues,
    hasPriceChanges: validation.hasPriceChanges,
    subtotal: validation.subtotalCents / 100,
    total: validation.totalCents / 100,
    issues: validation.issues,
    items: validation.items.map((item) => ({
      selectionId: item.selection.id,
      productSlug: item.selection.productSlug,
      name: item.selection.name,
      color: item.selection.color,
      size: item.selection.size,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
      unitPrice: item.unitPriceCents / 100,
      subtotal: item.lineSubtotalCents / 100,
      priceChanged: item.priceChanged,
    })),
  });
}
