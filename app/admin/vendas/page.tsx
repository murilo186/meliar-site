import { SalesWorkbench } from "@/components/admin/sales-workbench";
import { getAdminSalesSummariesPageFromDb } from "@/lib/admin/sales-orders";
import type { AdminSalesStatus } from "@/types/admin";

const allowedStatusValues = [
  "pending",
  "approved",
  "paid",
  "delivered",
  "cancelled",
] as const satisfies readonly AdminSalesStatus[];

type SalesSearchParams = {
  page?: string;
  q?: string;
  status?: string;
};

function parseStatus(value?: string): AdminSalesStatus | "all" {
  if (!value || value === "all") return "all";
  if (allowedStatusValues.includes(value as AdminSalesStatus)) {
    return value as AdminSalesStatus;
  }
  return "all";
}

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams?: Promise<SalesSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const query = String(params.q ?? "").trim().slice(0, 80);
  const status = parseStatus(params.status);
  const pageRaw = Number(params.page ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const paged = await getAdminSalesSummariesPageFromDb({
    page,
    pageSize: 10,
    query,
    status,
  });

  return (
    <SalesWorkbench
      counters={paged.counters}
      currentPage={paged.page}
      pageSize={paged.pageSize}
      query={query}
      rows={paged.rows}
      status={status}
      totalItems={paged.total}
      totalPages={paged.totalPages}
    />
  );
}
