import { storeConfig } from "@/config/store";

export function buildOrderSupportWhatsAppUrl(orderNumber: string) {
  const phone = storeConfig.whatsappNumber.replace(/\D/g, "");
  const message = `Olá, sobre o pedido ${orderNumber}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
