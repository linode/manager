import { UNKNOWN_PRICE } from './constants';

import type { Region } from '@linode/api-v4';

export interface DataCenterPricingOptions {
  /**
   * The base price for an entity.
   * @example 5 or 5.50
   */
  basePrice: number;
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

export const objectStoragePriceIncreaseMap = {
  'br-gru': {
    storage_overage: 0.028,
    transfer_overage: 0.007,
  },
  'id-cgk': {
    storage_overage: 0.024,
    transfer_overage: 0.015,
  },
};

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region increased costs.
 * @example
 * const price = getDCSpecificPrice({
 *   basePrice: getVolumePrice(20),
 *   regionId: 'us-east',
 * });
 * @returns a data center specific price
 */
export const getDCSpecificPrice = ({
  basePrice,
  regionId,
}: DataCenterPricingOptions) => {
  if (!regionId || !basePrice) {
    return undefined;
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
    return UNKNOWN_PRICE;
  }
  return Number.isInteger(monthlyPrice)
    ? monthlyPrice
    : monthlyPrice.toFixed(2);
};
