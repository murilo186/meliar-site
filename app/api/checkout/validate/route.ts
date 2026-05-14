import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOriginRequest } from "@/lib/http/request-origin";
import { validateCheckoutCartItems } from "@/lib/orders/checkout-validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import type { CartItem } from "@/types/cart";

const cartSelectionSchema = z.object({
  id: z.string().trim().min(1).max(200),
  productId: z.number().int().nonnegative(),
  productSlug: z.string().trim().min(1).max(140),
  name: z.string().trim().min(1).max(180),
  price: z.number().finite().nonnegative(),
  image: z.string().max(2_000).optional().default(""),
  color: z.string().trim().min(1).max(80),
  size: z.string().trim().min(1).max(40),
});

const cartItemSchema = z.object({
  selection: cartSelectionSchema,
  quantity: z.number().int().min(1).max(99),
});

const validateCheckoutPayloadSchema = z.object({
  items: z.array(cartItemSchema).max(30).optional().default([]),
});

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "checkout-validate");
  if (!checkRateLimit(rateLimitKey, { limit: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { message: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 },
    );
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Origem da requisição inválida." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { message: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const parsed = validateCheckoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const validation = await validateCheckoutCartItems(parsed.data.items as CartItem[]);

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
