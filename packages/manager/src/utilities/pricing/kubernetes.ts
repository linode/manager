import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import type { KubeNodePoolResponse, Region } from '@linode/api-v4/lib';
import type { FlagSet } from 'src/featureFlags';
import type { ExtendedType } from 'src/utilities/extendType';

interface MonthlyPriceOptions {
  count: number;
  flags: FlagSet;
  region: Region['id'] | undefined;
  type: ExtendedType | string;
  types: ExtendedType[];
}

interface TotalClusterPriceOptions {
  flags: FlagSet;
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
  flags,
  region,
  type,
  types,
}: MonthlyPriceOptions) => {
  if (!types || !type || !region) {
    return 0; // TODO
  }
  const thisType = types.find((t: ExtendedType) => t.id === type);
  const monthlyPrice = flags.dcSpecificPricing
    ? thisType
      ? getLinodeRegionPrice(thisType, region)?.monthly
      : 0
    : thisType?.price.monthly;

  return thisType ? (monthlyPrice ?? 0) * count : 0;
};

/**
 * Calculates the total monthly price of all pools in a cluster, plus HA if enabled.
 * @returns The total monthly cluster price
 */
export const getTotalClusterPrice = ({
  flags,
  highAvailabilityPrice,
  pools,
  region,
  types,
}: TotalClusterPriceOptions) => {
  const price = pools.reduce((accumulator, node) => {
    return (
      accumulator +
      getKubernetesMonthlyPrice({
        count: node.count,
        flags,
        region,
        type: node.type,
        types,
      })
    );
  }, 0);

  return highAvailabilityPrice ? price + highAvailabilityPrice : price;
};
