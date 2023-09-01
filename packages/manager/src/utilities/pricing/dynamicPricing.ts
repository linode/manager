import type { Region } from '@linode/api-v4';
import type { FlagSet } from 'src/featureFlags';

export interface DataCenterPricingOptions {
  /**
   * The base price for an entity.
   * @example 5 or 5.50
   */
  basePrice: number;
  /**
   * Our feature flags so we can determined whether or not to add price increase.
   * @example { dcSpecificPricing: true }
   */
  flags: FlagSet;
  /**
   * The `id` of the region we intended to get the price for.
   * @example us-east
   */
  regionId: Region['id'] | undefined;
}

// The key is a region id and the value is the percentage increase in price.
const priceIncreaseMap = {
  'br-gru': 0.4, // Sao Paulo
  'id-cgk': 0.2, // Jakarta
};

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region increased costs.
 * @example
 * const price = getDCSpecificPrice({
 *   basePrice: getVolumePrice(20),
 *   flags: { dcSpecificPricing: true },
 *   regionId: 'us-east',
 * });
 * @returns a datacenter specific price
 */
export const getDCSpecificPrice = ({
  basePrice,
  flags,
  regionId,
}: DataCenterPricingOptions) => {
  if (!flags?.dcSpecificPricing || !regionId) {
    // TODO: M3-7063 (defaults)
    return basePrice.toFixed(2);
  }

  const increaseFactor = priceIncreaseMap[regionId] as number | undefined;

  if (increaseFactor !== undefined) {
    // If increaseFactor is defined, it means the region has a price increase and we should apply it.
    const increase = basePrice * increaseFactor;

    return (basePrice + increase).toFixed(2);
  }

  return basePrice.toFixed(2);
};
