import { storeConfig } from "@/config/store";

type OrderSupportContext =
  | string
  | {
      orderNumber: string;
      source?: "cliente" | "admin";
      statusLabel?: string;
      intent?: string;
    };

export function buildOrderSupportWhatsAppUrl(context: OrderSupportContext) {
  const orderNumber = typeof context === "string" ? context : context.orderNumber;
  const source = typeof context === "string" ? "cliente" : context.source ?? "cliente";
  const statusLabel = typeof context === "string" ? undefined : context.statusLabel;
  const intent =
    typeof context === "string"
      ? "Quero tirar uma dúvida sobre este pedido."
      : context.intent ?? "Quero atualizar este pedido.";

  const phone = storeConfig.whatsappNumber.replace(/\D/g, "");
  const sourceLabel = source === "admin" ? "admin" : "cliente";
  const statusLine = statusLabel ? `Status atual no app: ${statusLabel}.` : "";
  const message = [
    `Olá, sou ${sourceLabel} e preciso de suporte no pedido ${orderNumber}.`,
    statusLine,
    intent,
  ]
    .filter(Boolean)
    .join(" ");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
