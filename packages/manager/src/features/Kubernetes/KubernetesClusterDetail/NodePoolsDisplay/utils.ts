/**
 * Checks whether prices are valid - 0 is valid, but undefined and null prices are invalid.
 * @returns true if either value is null or undefined
 */
export const hasInvalidNodePoolPrice = (
  pricePerNode: null | number | undefined,
  totalPrice: null | number | undefined
) => {
  const isInvalidPricePerNode = !pricePerNode && pricePerNode !== 0;
  const isInvalidTotalPrice = !totalPrice && totalPrice !== 0;

  return isInvalidPricePerNode || isInvalidTotalPrice;
};
