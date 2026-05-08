import { notFound } from "next/navigation";
import { SalesOrderDetail } from "@/components/admin/sales-order-detail";
import { getAdminSalesMockOrderById } from "@/data/admin-sales-mock";
import { getAdminSalesOrderByIdFromDb } from "@/lib/admin/sales-orders";

export default async function AdminSalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order = null;
  try {
    order = await getAdminSalesOrderByIdFromDb(id);
  } catch {
    order = null;
  }

  if (!order) {
    order = getAdminSalesMockOrderById(id);
  }

  if (!order) {
    notFound();
  }

  return <SalesOrderDetail order={order} />;
}
