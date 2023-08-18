import { getVolumePrice } from 'src/utilities/pricing/entityPricing';

import { BACKUP_PRICE, LKE_HA_PRICE, NODEBALANCER_PRICE } from './constants';

import type { Region } from '@linode/api-v4';

interface CalculatePriceProps {
  increaseValue: IncreaseValue;
  initialPrice: number;
}

export interface DataCenterPricingProps {
  entity: 'Backup' | 'LKE HA' | 'Nodebalancer' | 'Volume';
  regionId: Region['id'];
  size?: number;
}

enum IncreasedRegion {
  jakarta = 'id-cgk',
  saoPaulo = 'br-gru',
}

/**
 * The IncreaseValue represents a percentage of the initial price.
 * We may want to be able to control this value from a flag before being able to fetch it from the API.
 */
enum IncreaseValue {
  jakarta = 20,
  saoPaulo = 30,
}

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
 * @returns
 */
export const getDCSpecificPricingDisplay = ({
  entity,
  regionId,
  size,
}: DataCenterPricingProps) => {
  const isJakarta: boolean = regionId === IncreasedRegion.jakarta;
  const isSaoPaulo: boolean = regionId === IncreasedRegion.saoPaulo;
  const volumePrice: number = getVolumePrice(size);

  const getDynamicPrice = (initialPrice: number): string => {
    if (isJakarta) {
      return calculatePrice({
        increaseValue: IncreaseValue.jakarta,
        initialPrice,
      });
    } else if (isSaoPaulo) {
      return calculatePrice({
        increaseValue: IncreaseValue.saoPaulo,
        initialPrice,
      });
    } else {
      return initialPrice.toFixed(2);
    }
  };

  switch (entity) {
    case 'Backup':
      return getDynamicPrice(BACKUP_PRICE);
    case 'LKE HA':
      return getDynamicPrice(LKE_HA_PRICE);
    case 'Nodebalancer':
      return getDynamicPrice(NODEBALANCER_PRICE);
    case 'Volume':
      return getDynamicPrice(volumePrice);
    default:
      return '0.00';
  }
};

const calculatePrice = ({
  increaseValue,
  initialPrice,
}: CalculatePriceProps) => {
  const price = Number(initialPrice);
  const increase = price * (increaseValue / 100);

  return (price + increase).toFixed(2);
};
