import { notFound } from "next/navigation";
import { SalesOrderDetail } from "@/components/admin/sales-order-detail";
import { getAdminSalesMockOrderById } from "@/data/admin-sales-mock";

export default async function AdminSalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getAdminSalesMockOrderById(id);

  if (!order) {
    notFound();
  }

  return <SalesOrderDetail order={order} />;
}

