import { buildWhatsAppMessage } from "@/lib/whatsapp/build-whatsapp-message";
import type { CartItem } from "@/components/cart/cart-store";

export function buildWhatsAppUrl(phoneNumber: string, items: CartItem[]) {
  const encodedMessage = encodeURIComponent(buildWhatsAppMessage(items));

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
