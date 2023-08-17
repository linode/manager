import {
  getBackupPrice,
  getLKEClusterHAPrice,
  getNodeBalancerPrice,
  getVolumePrice,
} from 'src/utilities/pricing/entityPricing';

import type { Region } from '@linode/api-v4';

interface CalculatePriceProps {
  initialPrice: number;
  upcostValue: UpcostValue;
}

export interface DataCenterPricingProps {
  entity: 'Backup' | 'LKE HA' | 'Nodebalancer' | 'Volume';
  regionId: Region['id'];
  size?: number;
}

enum UpcostRegion {
  jakarta = 'id-cgk',
  saoPaulo = 'br-gru',
}

/**
 * The UpcostValue represents a percentage of the initial price.
 * We may want to be able to control this value from a flag before being able to fetch it from the API.
 */
enum UpcostValue {
  jakartaUpcost = 20,
  saoPauloUpcost = 30,
}

/**
 * This function is used to calculate the dynamic pricing for a given entity, based on potential region upcosts.
 * @param entity The entity to calculate pricing for.
 * @param region The region to calculate pricing for.
 * @param size An optional size value for entities that require it for field validation (ex: Volumes).
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
  const isJakarta: boolean = regionId === UpcostRegion.jakarta;
  const isSaoPaulo: boolean = regionId === UpcostRegion.saoPaulo;
  const backupPrice = getBackupPrice();
  const lkePrice = getLKEClusterHAPrice();
  const nodeBalancerPrice = getNodeBalancerPrice();
  const volumePrice: number = getVolumePrice(size);

  const getDynamicPrice = (initialPrice: number): string => {
    if (isJakarta) {
      return calculatePrice({
        initialPrice,
        upcostValue: UpcostValue.jakartaUpcost,
      });
    } else if (isSaoPaulo) {
      return calculatePrice({
        initialPrice,
        upcostValue: UpcostValue.saoPauloUpcost,
      });
    } else {
      return initialPrice.toFixed(2);
    }
  };

  switch (entity) {
    case 'Backup':
      return getDynamicPrice(backupPrice);
    case 'LKE HA':
      return getDynamicPrice(lkePrice);
    case 'Nodebalancer':
      return getDynamicPrice(nodeBalancerPrice);
    case 'Volume':
      return getDynamicPrice(volumePrice);
    default:
      return '0.00';
  }
};

const calculatePrice = ({ initialPrice, upcostValue }: CalculatePriceProps) => {
  const price = Number(initialPrice);
  const upcost = price * (upcostValue / 100);

  return (price + upcost).toFixed(2);
};
