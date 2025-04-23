import { getLinodeRegionPrice } from './linodes';

import type { KubeNodePoolResponse, Region } from '@linode/api-v4/lib';
import type { ExtendedType } from 'src/utilities/extendType';

interface MonthlyPriceOptions {
  count: number;
  region: Region['id'] | undefined;
  type: ExtendedType | string;
  types: ExtendedType[];
}

interface TotalClusterPriceOptions {
  enterprisePrice?: number;
  highAvailabilityPrice?: number;
  pools: KubeNodePoolResponse[];
  region: Region['id'] | undefined;
  types: ExtendedType[];
}

/**
 * Calculates the monthly price of a group of linodes based on region and types.
 * @returns The monthly price for the linodes, or 0 if price cannot be calculated
 */
export const getKubernetesMonthlyPrice = ({
  count,
  region,
  type,
  types,
}: MonthlyPriceOptions) => {
  if (!types || !type || !region) {
    return undefined;
  }
  const thisType = types.find((t: ExtendedType) => t.id === type);

  const monthlyPrice = getLinodeRegionPrice(thisType, region)?.monthly;

  return monthlyPrice ? monthlyPrice * count : monthlyPrice;
};

/**
 * Calculates the total monthly price of all pools in a cluster, plus HA if enabled.
 * @returns The total monthly cluster price
 */
export const getTotalClusterPrice = ({
  enterprisePrice,
  highAvailabilityPrice,
  pools,
  region,
  types,
}: TotalClusterPriceOptions) => {
  const price = pools.reduce((accumulator, node) => {
    const kubernetesMonthlyPrice = getKubernetesMonthlyPrice({
      count: node.count,
      region,
      type: node.type,
      types,
    });
    return accumulator + (kubernetesMonthlyPrice ?? 0);
  }, 0);

  if (enterprisePrice) {
    return price + enterprisePrice;
  }
  if (highAvailabilityPrice) {
    return price + highAvailabilityPrice;
  }

  return price;
};
