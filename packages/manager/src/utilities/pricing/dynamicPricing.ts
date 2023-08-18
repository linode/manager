import type { Region } from '@linode/api-v4';
import type { FlagSet } from 'src/featureFlags';

export interface DataCenterPricingOptions {
  basePrice: number;
  flags: FlagSet;
  regionId: Region['id'];
}

// The key is a region id and the value is the percentage
// increase in price.
const priceIncreaseMap = {
  'br-gru': 0.3, // Sao Paulo
  'id-cgk': 0.2, // Jakarta
};

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region increased costs.
 * @param entity The entity to calculate pricing for.
 * @param region The region to calculate pricing for.
 * @param size An optional size value for entities that require it for price based on it (ex: Volume).
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
  if (!flags?.dcSpecificPricing) {
    return basePrice.toFixed(2);
  }

  const increaseFactor = priceIncreaseMap[regionId] as number | undefined;

  if (increaseFactor !== undefined) {
    // If increaseFactor is defined, it means the region has a price increase
    // and that we should apply it.
    const increase = basePrice * increaseFactor;

    return (basePrice + increase).toFixed(2);
  }

  return basePrice.toFixed(2);
};
