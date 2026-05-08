import { NextResponse } from "next/server";
import { createWhatsAppOrder } from "@/lib/orders/create-whatsapp-order";
import type { CartItem } from "@/types/cart";

interface CheckoutPayload {
  items?: CartItem[];
}

export async function POST(request: Request) {
  let payload: CheckoutPayload | null = null;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ message: "Corpo da requisição inválido." }, { status: 400 });
  }

  const items = payload?.items ?? [];

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: "Adicione itens à sacola para finalizar." }, { status: 400 });
  }

  try {
    const checkout = await createWhatsAppOrder(items);
    return NextResponse.json(checkout, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível iniciar o pedido.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
