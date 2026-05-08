import { SalesWorkbench } from "@/components/admin/sales-workbench";
import { getAdminSalesMockSummaries } from "@/data/admin-sales-mock";

export default function AdminSalesPage() {
  return <SalesWorkbench initialOrders={getAdminSalesMockSummaries()} />;
}
