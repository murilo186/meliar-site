import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOriginRequest } from "@/lib/http/request-origin";
import { CheckoutValidationError } from "@/lib/orders/checkout-validation";
import { createWhatsAppOrder } from "@/lib/orders/create-whatsapp-order";
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

const checkoutPayloadSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(30),
});

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "checkout-whatsapp");
  if (!checkRateLimit(rateLimitKey, { limit: 5, windowMs: 60_000 })) {
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
    return NextResponse.json({ message: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = checkoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  try {
    const checkout = await createWhatsAppOrder(parsed.data.items as CartItem[]);
    return NextResponse.json(checkout, { status: 200 });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json(
        {
          message: error.message,
          issues: error.issues,
        },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Não foi possível iniciar o pedido.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
