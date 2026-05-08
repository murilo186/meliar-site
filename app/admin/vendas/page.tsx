import { SalesWorkbench } from "@/components/admin/sales-workbench";
import { getAdminSalesMockSummaries } from "@/data/admin-sales-mock";
import { getAdminSalesSummariesFromDb } from "@/lib/admin/sales-orders";

export default async function AdminSalesPage() {
  try {
    const orders = await getAdminSalesSummariesFromDb();
    return <SalesWorkbench initialOrders={orders} />;
  } catch {
    return <SalesWorkbench initialOrders={getAdminSalesMockSummaries()} />;
  }
}
