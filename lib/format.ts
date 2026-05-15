export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getDiscountPercent(currentPrice: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= 0 || oldPrice <= currentPrice) {
    return null;
  }

  const raw = (1 - currentPrice / oldPrice) * 100;
  const discount = Math.round(raw);
  return discount > 0 ? discount : null;
}
