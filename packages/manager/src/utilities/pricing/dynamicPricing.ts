import { getVolumePrice } from 'src/utilities/pricing/entityPricing';

import { BACKUP_PRICE, LKE_HA_PRICE, NODEBALANCER_PRICE } from './constants';

import type { Region } from '@linode/api-v4';

interface CalculatePriceOptions {
  increaseValue: number;
  initialPrice: number;
}

export interface DataCenterPricingOptions {
  entity: 'Backup' | 'LKE HA' | 'Nodebalancer' | 'Volume';
  regionId: Region['id'];
  size?: number;
}

// The key is a region id and the value is the percentage
// increase in price.
const priceIncreaseMap = {
  'br-gru': 30,
  'id-cgk': 20,
};

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region increased costs.
 * @param entity The entity to calculate pricing for.
 * @param region The region to calculate pricing for.
 * @param size An optional size value for entities that require it for price based on it (ex: Volume).
 * @example
 * const price = getDCSpecificPricing({
 *   entity: 'Volume',
 *   regionId: 'us-east-1a',
 *   size: 20,
 * });
 * @returns a datacenter specific price
 */
export const getDCSpecificPricingDisplay = ({
  entity,
  regionId,
  size,
}: DataCenterPricingOptions) => {
  const increaseValue = priceIncreaseMap[regionId] as number | undefined;

  const getDynamicPrice = (initialPrice: number): string => {
    if (increaseValue !== undefined) {
      return calculatePrice({
        increaseValue,
        initialPrice,
      });
    }

    return initialPrice.toFixed(2);
  };

  switch (entity) {
    case 'Backup':
      return getDynamicPrice(BACKUP_PRICE);
    case 'LKE HA':
      return getDynamicPrice(LKE_HA_PRICE);
    case 'Nodebalancer':
      return getDynamicPrice(NODEBALANCER_PRICE);
    case 'Volume':
      const volumePrice: number = getVolumePrice(size);
      return getDynamicPrice(volumePrice);
    default:
      return '0.00';
  }
};

const calculatePrice = ({
  increaseValue,
  initialPrice,
}: CalculatePriceOptions) => {
  const price = Number(initialPrice);
  const increase = price * (increaseValue / 100);

  return (price + increase).toFixed(2);
};
