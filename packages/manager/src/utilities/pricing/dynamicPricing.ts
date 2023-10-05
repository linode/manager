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
export const priceIncreaseMap = {
  'br-gru': 0.4, // Sao Paulo
  'id-cgk': 0.2, // Jakarta
};

// TODO: DC Pricing - M3-6973: Update these values when beta pricing ends.
export const objectStoragePriceIncreaseMap = {
  'br-gru': {
    monthly: 0.0,
    storage_overage: 0.0,
    transfer_overage: 0.0,
  },
  'id-cgk': {
    monthly: 0.0,
    storage_overage: 0.0,
    transfer_overage: 0.0,
  },
};

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region increased costs.
 * @example
 * const price = getDCSpecificPrice({
 *   basePrice: getVolumePrice(20),
 *   flags: { dcSpecificPricing: true },
 *   regionId: 'us-east',
 * });
 * @returns a data center specific price
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

export const renderMonthlyPriceToCorrectDecimalPlace = (
  monthlyPrice: null | number | undefined
) => {
  if (!monthlyPrice) {
    return '--.--';
  }
  return Number.isInteger(monthlyPrice)
    ? monthlyPrice
    : monthlyPrice.toFixed(2);
};
