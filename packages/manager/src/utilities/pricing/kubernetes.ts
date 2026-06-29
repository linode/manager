import {
  getLinodeRegionPrice,
  UNKNOWN_PRICE,
} from '@akamai/compute-ui-core/api';

import { HOURS_IN_MONTH } from './constants';
import {
  formatPrice,
  getLabelForInterval,
  getPriceForInterval,
} from './priceInterval';

import type {
  CreateNodePoolData,
  KubeNodePoolResponse,
  LinodeType,
  PriceObject,
  Region,
} from '@linode/api-v4/lib';

interface MonthlyPriceOptions {
  billing: keyof PriceObject;
  count: number;
  region: Region['id'] | undefined;
  type: LinodeType | string;
  types: LinodeType[];
}

interface TotalClusterPriceOptions {
  enterprisePrice?: number;
  /**
   * Optional per-pool active billing resolver from `useComputePricing().getBillingForPlanType`.
   * Determines each pool's active billing mode based on the LD flag.
   */
  getBillingForPlanType?: (typeId: string) => keyof PriceObject;
  highAvailabilityPrice?: number;
  pools: (CreateNodePoolData | KubeNodePoolResponse)[];
  region: Region['id'] | undefined;
  types: LinodeType[];
}

export const getEstimatedMonthlyCostFromHourly = (hourlyCost: number): number =>
  hourlyCost * HOURS_IN_MONTH;

/**
 * Calculates the monthly price of a group of linodes (pool) based on region and types.
 * For hourly-only plans (monthly price is absent), estimates monthly cost as
 * hourly × HOURS_IN_MONTH.
 * @returns The monthly price for the linodes, or undefined if price cannot be calculated
 */
export const getKubernetesMonthlyPrice = ({
  billing,
  count,
  region,
  type,
  types,
}: MonthlyPriceOptions) => {
  if (!types || !type || !region || !billing) {
    return undefined;
  }

  const thisType = types.find((t) => t.id === type);
  const priceObj = getLinodeRegionPrice(thisType, region);

  if (billing === 'hourly') {
    const hourly = priceObj?.hourly;
    if (typeof hourly !== 'number') {
      return undefined;
    }
    // For hourly billing, we estimate total monthly cost using hourly rate
    const hourlyTotal = hourly * count;
    return getEstimatedMonthlyCostFromHourly(hourlyTotal);
  }

  if (billing === 'monthly') {
    const monthly = getPriceForInterval(priceObj, 'monthly');
    if (typeof monthly !== 'number') {
      return undefined;
    }
    return monthly * count;
  }

  // Unknown billing mode
  return undefined;
};

/**
 * Calculates the total monthly price of all pools in a cluster, plus HA if enabled.
 * @returns The total monthly cluster price
 */
export const getTotalClusterPrice = ({
  enterprisePrice,
  getBillingForPlanType,
  highAvailabilityPrice,
  pools,
  region,
  types,
}: TotalClusterPriceOptions) => {
  const price = pools.reduce((accumulator, node) => {
    const kubernetesMonthlyPrice = getKubernetesMonthlyPrice({
      billing: getBillingForPlanType?.(node.type as string) ?? 'monthly',
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

/**
 * Formats the per-node price for display in node pool drawers.
 * - Monthly billing: '$X/mo'
 * - Hourly billing: '$X/hr'
 *
 * Pass `billing` from `useComputePricing` so the format follows the active billing mode.
 */
export const getNodePriceDisplay = (
  nodePriceObj: PriceObject | undefined,
  billing: keyof PriceObject
): string => {
  const price = getPriceForInterval(nodePriceObj, billing);
  if (typeof price !== 'number') {
    return `$${UNKNOWN_PRICE}`;
  }
  return `$${formatPrice(price)}/${getLabelForInterval(billing, 'short')}`;
};

/**
 * Formats the total pool price for display in node pool drawers and the cluster checkout bar.
 * - Monthly billing: '$X/mo' (monthly price x count)
 * - Hourly billing: '$X/hr (Est. ~$Y/mo)' (hourly price x count and estimated monthly appended)
 *
 * Pass `billing` from `useComputePricing` - same reason as `getNodePriceDisplay`.
 */
export const getPoolPriceDisplay = (
  nodePriceObj: PriceObject | undefined,
  count: number,
  billing: keyof PriceObject
): string => {
  const price = getPriceForInterval(nodePriceObj, billing);
  if (typeof price !== 'number') {
    return `$${UNKNOWN_PRICE}`;
  }
  const total = price * count;
  const intervalLabel = getLabelForInterval(billing, 'short');
  const displayPrice = `$${formatPrice(total)}/${intervalLabel}`;

  if (billing === 'hourly') {
    const monthlyEstimate = getEstimatedMonthlyCostFromHourly(total);
    const monthlyIntervalLabel = getLabelForInterval('monthly', 'short');
    return `${displayPrice} (Est. ~$${formatPrice(monthlyEstimate)}/${monthlyIntervalLabel})`;
  }
  if (billing === 'monthly') {
    return displayPrice;
  }
  return `$${UNKNOWN_PRICE}`;
};
