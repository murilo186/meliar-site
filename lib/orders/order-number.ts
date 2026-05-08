export function buildOrderNumber(orderId: string) {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}
