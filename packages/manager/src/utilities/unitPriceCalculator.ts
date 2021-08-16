export default function unitPriceCalculator(
  unitPrice: number,
  quantity: number
) {
  return `$${Math.max(unitPrice * quantity, 0).toFixed(2)}`;
}
