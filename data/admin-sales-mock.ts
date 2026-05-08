import type { AdminSalesOrder, AdminSalesOrderSummary } from "@/types/admin";

export const adminSalesMock: AdminSalesOrder[] = [
  {
    id: "ord-001",
    orderNumber: "#1001",
    status: "open",
    channel: "whatsapp",
    customerName: "Mariana Souza",
    customerPhone: "5581988881111",
    createdAt: "2026-05-08T11:45:00.000Z",
    totalCents: 23980,
    notes: "Cliente pediu envio para Recife.",
    items: [
      {
        id: "item-001-1",
        productName: "Vestido Oncinha",
        variantLabel: "Animal print • M",
        imageUrl: "/images/roupas/vestidos/vestido_oncinha/F7275995.webp",
        quantity: 1,
        unitPriceCents: 18990,
        subtotalCents: 18990,
      },
      {
        id: "item-001-2",
        productName: "Cropped Babado",
        variantLabel: "Rosa claro • P",
        imageUrl: "/images/roupas/partes_de_cima/croppeds/cropped_babado/8473FFE0.webp",
        quantity: 1,
        unitPriceCents: 4990,
        subtotalCents: 4990,
      },
    ],
  },
  {
    id: "ord-002",
    orderNumber: "#1002",
    status: "paid",
    channel: "whatsapp",
    customerName: "Ana Carolina",
    customerPhone: "5581999912345",
    createdAt: "2026-05-08T10:12:00.000Z",
    totalCents: 15990,
    items: [
      {
        id: "item-002-1",
        productName: "Calça Cargo Creme",
        variantLabel: "Creme • 38",
        imageUrl: "/images/roupas/partes_de_baixo/calcas/calca_cargocreme/12CBA691.webp",
        quantity: 1,
        unitPriceCents: 15990,
        subtotalCents: 15990,
      },
    ],
  },
  {
    id: "ord-003",
    orderNumber: "#1003",
    status: "in_delivery",
    channel: "whatsapp",
    customerName: "Larissa Matos",
    customerPhone: "5581977773311",
    createdAt: "2026-05-07T18:30:00.000Z",
    totalCents: 19980,
    items: [
      {
        id: "item-003-1",
        productName: "Cropped Diferenciado",
        variantLabel: "Off-white • M",
        imageUrl: "/images/roupas/partes_de_cima/croppeds/cropped_diferenciado/off-white/cropped1.webp",
        quantity: 2,
        unitPriceCents: 9990,
        subtotalCents: 19980,
      },
    ],
  },
  {
    id: "ord-004",
    orderNumber: "#1004",
    status: "finished",
    channel: "manual",
    customerName: "Bruna Silva",
    customerPhone: "5581980002233",
    createdAt: "2026-05-06T16:00:00.000Z",
    totalCents: 14990,
    items: [
      {
        id: "item-004-1",
        productName: "Saia Flor Dourada",
        variantLabel: "Preta • P",
        imageUrl: "/images/roupas/partes_de_baixo/saias/saia_flordourada/0B0BDC32.webp",
        quantity: 1,
        unitPriceCents: 14990,
        subtotalCents: 14990,
      },
    ],
  },
  {
    id: "ord-005",
    orderNumber: "#1005",
    status: "cancelled",
    channel: "whatsapp",
    customerName: "Juliana Campos",
    customerPhone: "5581966665522",
    createdAt: "2026-05-06T11:20:00.000Z",
    totalCents: 9990,
    notes: "Cliente desistiu durante negociação.",
    items: [
      {
        id: "item-005-1",
        productName: "Cropped Transparente",
        variantLabel: "Nude • G",
        imageUrl: "/images/roupas/partes_de_cima/croppeds/cropped_transparente/08417296.webp",
        quantity: 1,
        unitPriceCents: 9990,
        subtotalCents: 9990,
      },
    ],
  },
  {
    id: "ord-006",
    orderNumber: "#1006",
    status: "open",
    channel: "whatsapp",
    customerName: "Paula Menezes",
    customerPhone: "5581944447788",
    createdAt: "2026-05-08T09:05:00.000Z",
    totalCents: 21990,
    items: [
      {
        id: "item-006-1",
        productName: "Conjunto Bege",
        variantLabel: "Bege • G",
        imageUrl: "/images/roupas/conjuntos/conjunto_bege/937ACA5A.webp",
        quantity: 1,
        unitPriceCents: 21990,
        subtotalCents: 21990,
      },
    ],
  },
];

export function getAdminSalesMockSummaries(): AdminSalesOrderSummary[] {
  return adminSalesMock.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    channel: order.channel,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    createdAt: order.createdAt,
    totalCents: order.totalCents,
    itemsCount: order.items.length,
  }));
}

export function getAdminSalesMockOrderById(id: string) {
  return adminSalesMock.find((order) => order.id === id) ?? null;
}
