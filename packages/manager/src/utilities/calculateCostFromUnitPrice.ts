/**
 * Returns a string representation of total cost of a quantity at a given unit price.
 *
 * @param unitPrice - The cost per unit in dollars
 * @param sourceQuantity - The number of units to calculate the total cost for
 */

export default function calculateCostFromUnitPrice(
  unitPrice: number,
  quantity: number
) {
  return `$${Math.max(unitPrice * quantity, 0).toFixed(2)}`;
}
