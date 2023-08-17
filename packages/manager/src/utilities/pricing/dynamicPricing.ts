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

interface DataCenterPricingProps {
  entity: 'Backup' | 'LKE HA' | 'Nodebalancer' | 'Volume';
  regionId: Region['id'];
  value: number;
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
 * @param value The value to calculate pricing for.
 * @example
 * const price = getDCSpecificPricing({
 *   entity: 'Volume',
 *   regionId: 'us-east-1a',
 *   value: 20,
 * });
 * @returns
 */
export const getDCSpecificPricingDisplay = ({
  entity,
  regionId,
  value,
}: DataCenterPricingProps) => {
  let price;
  const isJakarta: boolean = regionId === UpcostRegion.jakarta;
  const isSaoPaulo: boolean = regionId === UpcostRegion.saoPaulo;
  const backupPrice = getBackupPrice();
  const lkePrice = getLKEClusterHAPrice();
  const nodeBalancerPrice = getNodeBalancerPrice();
  const volumePrice: number = getVolumePrice(value);

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
      price = getDynamicPrice(backupPrice);
      break;
    case 'LKE HA':
      price = getDynamicPrice(lkePrice);
      break;
    case 'Nodebalancer':
      price = getDynamicPrice(nodeBalancerPrice);
      break;
    case 'Volume':
      price = getDynamicPrice(volumePrice);
      break;

    default:
      price = '0.00';
  }

  return price;
};

const calculatePrice = ({ initialPrice, upcostValue }: CalculatePriceProps) => {
  const price = Number(initialPrice);
  const upcost = price * (upcostValue / 100);

  return (price + upcost).toFixed(2);
};
