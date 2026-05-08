import { buildWhatsAppMessage } from "@/lib/whatsapp/build-whatsapp-message";
import type { CartItem } from "@/types/cart";

export function buildWhatsAppUrl(
  phoneNumber: string,
  items: CartItem[],
  orderNumber?: string,
) {
  const encodedMessage = encodeURIComponent(
    buildWhatsAppMessage(items, orderNumber),
  );

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
