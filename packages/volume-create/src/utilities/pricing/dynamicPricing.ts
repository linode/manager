import type { PriceType, Region, RegionPriceObject } from "@linode/api-v4";

interface RegionPrice extends RegionPriceObject {
  id: string;
}

interface DataCenterPricingByTypeOptions {
  /**
   * The number of decimal places to return for the price.
   *  @default 2
   */
  decimalPrecision?: number;
  /**
   * The time period for which to find pricing data for (hourly or monthly).
   *  @default monthly
   */
  interval?: "hourly" | "monthly";
  /**
   * The `id` of the region we intended to get the price for.
   * @example us-east
   */
  regionId: Region["id"] | undefined;
  /**
   * Optionally allows price to be calculated by a factor of entity size.
   * @example 20 (GB) for a volume
   */
  size?: number;
  /**
   * The type data from a product's /types endpoint.
   */
  type: PriceType | undefined;
}

// The key is a region id and the value is the percentage increase in price.

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region increased costs.
 * @example
 * const price = getDCSpecificPriceByType({
 *   size: 20,
 *   type: volumeType, // From the volumes/types endpoint
 *   regionId: 'us-east',
 * });
 * @returns a data center specific price or undefined if this cannot be calculated
 */
export const getDCSpecificPriceByType = ({
  decimalPrecision = 2,
  interval = "monthly",
  regionId,
  size,
  type,
}: DataCenterPricingByTypeOptions): string | undefined => {
  if (!regionId || !type) {
    return undefined;
  }
  // Apply the DC-specific price if it exists; otherwise, use the base price.
  const price =
    type.region_prices.find((region_price: RegionPrice) => {
      return region_price.id === regionId;
    })?.[interval] ?? type.price?.[interval];

  // If pricing is determined by size of the entity
  if (size && price) {
    return (size * price).toFixed(decimalPrecision);
  }

  return price?.toFixed(decimalPrecision) ?? undefined;
};
