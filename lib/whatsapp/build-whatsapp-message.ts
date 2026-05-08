import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/components/cart/cart-store";

export function buildWhatsAppMessage(items: CartItem[]) {
  const total = items.reduce(
    (sum, item) => sum + item.selection.price * item.quantity,
    0,
  );

  const lines = [
    "Olá, quero finalizar este pedido da Meliar:",
    "",
    ...items.flatMap((item) => {
      const subtotal = item.selection.price * item.quantity;

      return [
        `- Produto: ${item.selection.name}`,
        `  Cor: ${item.selection.color}`,
        `  Tamanho: ${item.selection.size}`,
        `  Quantidade: ${item.quantity}`,
        `  Valor unitário: ${formatCurrency(item.selection.price)}`,
        `  Subtotal: ${formatCurrency(subtotal)}`,
        "",
      ];
    }),
    `Total do pedido: ${formatCurrency(total)}`,
    "",
    "Podemos combinar entrega e forma de pagamento?",
  ];

  return lines.join("\n").trim();
}
