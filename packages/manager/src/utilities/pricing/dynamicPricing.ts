import { UNKNOWN_PRICE } from './constants';

import type { PriceType, Region, RegionPriceObject } from '@linode/api-v4';

export interface RegionPrice extends RegionPriceObject {
  id: string;
}

// TODO: Delete once all products are using /types endpoints.
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

export interface DataCenterPricingByTypeOptions {
  /**
   * The `id` of the region we intended to get the price for.
   * @example us-east
   */
  regionId: Region['id'] | undefined;
  /**
   * The type data from a product's /types endpoint.
   */
  type: PriceType | undefined;
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

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region increased costs.
 * @example
 * const price = getDCSpecificPrice({
 *   type: volumeType, // From the volumes/types endpoint
 *   regionId: 'us-east',
 * });
 * @returns a data center specific price or undefined if this cannot be calculated
 */
export const getDCSpecificPriceByType = ({
  regionId,
  type,
}: DataCenterPricingByTypeOptions): string | undefined => {
  if (!regionId || !type) {
    return undefined;
  }

  // Apply the DC-specific price if it exists; otherwise, use the base price.
  const price =
    type.region_prices.find((region_price: RegionPrice) => {
      return region_price.id === regionId;
    })?.monthly ?? type.price.monthly;

  return price?.toFixed(2) ?? undefined;
};

export const renderMonthlyPriceToCorrectDecimalPlace = (
  monthlyPrice: null | number | undefined
) => {
  if (typeof monthlyPrice !== 'number') {
    return UNKNOWN_PRICE;
  }
  return Number.isInteger(monthlyPrice)
    ? monthlyPrice
    : monthlyPrice.toFixed(2);
};
