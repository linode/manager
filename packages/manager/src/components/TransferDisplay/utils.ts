import { DateTime } from 'luxon';

import type {
  Region,
  RegionalNetworkUtilization,
  RegionalTransferObject,
} from '@linode/api-v4';

/**
 * Get the number of days remaining in the current month.
 * @returns number
 */
export const getDaysRemaining = () =>
  Math.floor(
    DateTime.local()
      .setZone('America/New_York')
      .endOf('month')
      .diffNow('days')
      .toObject().days ?? 0
  );

export type TransferDataOptions =
  | RegionalNetworkUtilization
  | RegionalTransferObject
  | undefined;

/**
 * Calculates the percentage of network transfer used.
 * Usage percentage should not be 100% if there has been no usage or usage has not exceeded quota.
 * @param data
 * @returns number
 * @example calculatePoolUsagePct({ quota: 1000, used: 500 }) // 50
 */
export const calculatePoolUsagePct = (data: TransferDataOptions) => {
  if (!data?.quota || !data?.used) {
    return 0;
  }

  const { quota, used } = data;

  return used < quota ? (used / quota) * 100 : used === 0 ? 0 : 100;
};

export interface RegionTransferPool {
  pct: number;
  quota: number;
  regionID: string;
  regionName: string;
  used: number;
}

/**
 * Get the percentage of network transfer used for each region transfer pool.
 * @param generalPoolUsage
 * @param regions
 * @returns an array of objects containing the percentage of network transfer used and the region name
 * @example
 * getRegionTransferPools(generalPoolUsage, regions)
 *
 *[
 *  {
 *    pct: 50,
 *    quota: 1000,
 *    regionName: 'us-east',
 *    used: 500,
 *  },
 *  {
 *    pct: 50,
 *    quota: 1000,
 *    regionName: 'us-west',
 *    used: 200,
 *  },
 *]
 */
export const getRegionTransferPools = (
  generalPoolUsage: RegionalNetworkUtilization | undefined,
  regions: Region[] | undefined
): RegionTransferPool[] | undefined => {
  if (!generalPoolUsage || !regions) {
    return;
  }

  return generalPoolUsage?.region_transfers?.map((pool) => {
    const regionName: string =
      regions?.find((r) => r.id === pool.id)?.label ?? '';

    return {
      pct: calculatePoolUsagePct(pool),
      quota: pool.quota,
      regionID: pool.id,
      regionName,
      used: pool.used,
    };
  });
};

/**
 * Format the percentage of network transfer used for display.
 * @param pct
 * @returns string
 * @example formatPoolUsagePct(0.5) // '50%'
 */
export const formatPoolUsagePct = (pct: number): string => {
  return `${pct.toFixed(pct < 1 ? 2 : 0)}%`;
};
