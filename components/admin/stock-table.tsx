import { StockSubmitButton } from "@/components/admin/stock-submit-button";
import type { AdminStockRow } from "@/types/admin";

type StockTableProps = {
  rows: AdminStockRow[];
  currentPath: string;
  onSubmit: (formData: FormData) => Promise<void>;
};

function getStockClass(stock: number) {
  if (stock === 0) return "text-red-700 font-bold";
  if (stock <= 3) return "text-amber-700 font-semibold";
  return "font-semibold";
}

export function StockTable({ rows, currentPath, onSubmit }: StockTableProps) {
  return (
    <>
      <div className="w-full max-w-full overflow-x-auto overscroll-x-contain border border-black/10 bg-white touch-pan-x">
        <table className="min-w-[980px] text-sm">
          <thead className="bg-[#ffe4ec] text-left">
            <tr>
              <th className="px-3 py-2 font-semibold">Produto</th>
              <th className="px-3 py-2 font-semibold">Cor</th>
              <th className="px-3 py-2 font-semibold">Tamanho</th>
              <th className="px-3 py-2 font-semibold">SKU</th>
              <th className="px-3 py-2 font-semibold">Saldo</th>
              <th className="px-3 py-2 font-semibold">Ativa</th>
              <th className="px-3 py-2 font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const product = Array.isArray(row.products) ? row.products[0] : row.products;
              const color = Array.isArray(row.colors) ? row.colors[0] : row.colors;
              const size = Array.isArray(row.sizes) ? row.sizes[0] : row.sizes;

              return (
                <tr className="border-t border-black/10" key={row.id}>
                  <td className="px-3 py-2">{product?.name ?? "-"}</td>
                  <td className="px-3 py-2">{color?.name ?? "-"}</td>
                  <td className="px-3 py-2">{size?.name ?? "-"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                  <td className={`px-3 py-2 ${getStockClass(row.stock_quantity)}`}>{row.stock_quantity}</td>
                  <td className="px-3 py-2">{row.is_available ? "Sim" : "Não"}</td>
                  <td className="px-3 py-2">
                    <form action={onSubmit} className="flex items-center gap-2">
                      <input type="hidden" name="variantId" value={row.id} />
                      <input type="hidden" name="redirectTo" value={currentPath} />
                      <input
                        className="h-8 w-20 border px-2 text-xs rounded-none"
                        defaultValue={String(row.stock_quantity)}
                        min={0}
                        name="stockQuantity"
                        type="number"
                      />
                      <label className="flex items-center gap-1 text-xs">
                        <input defaultChecked={row.is_available} name="isAvailable" type="checkbox" />
                        Ativa
                      </label>
                      <StockSubmitButton />
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground md:hidden">
        Deslize a tabela para o lado para ver todas as colunas.
      </p>
    </>
  );
}
