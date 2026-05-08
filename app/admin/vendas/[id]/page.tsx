import { notFound } from "next/navigation";
import { SalesOrderDetail } from "@/components/admin/sales-order-detail";
import { getAdminSalesOrderByIdFromDb } from "@/lib/admin/sales-orders";

export default async function AdminSalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminSalesOrderByIdFromDb(id);

  if (!order) {
    notFound();
  }

  return <SalesOrderDetail order={order} />;
}
