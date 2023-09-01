import { DateTime } from 'luxon';

import type {
  Region,
  RegionalNetworkUtilization,
  RegionalTransferObject,
} from '@linode/api-v4';

export const getDaysRemaining = () =>
  Math.floor(
    DateTime.local()
      .setZone('America/New_York')
      .endOf('month')
      .diffNow('days')
      .toObject().days ?? 0
  );

/**
 * Calculates the percentage of network transfer used.
 * Usage percentage should not be 100% if there has been no usage or usage has not exceeded quota.
 * @param data
 * @returns number
 */
export const calculatePoolUsagePct = (
  data: RegionalNetworkUtilization | RegionalTransferObject | undefined
) => {
  if (!data?.quota || !data?.used) {
    return 0;
  }

  const { quota, used } = data;

  return used < quota ? (used / quota) * 100 : used === 0 ? 0 : 100;
};

/**
 * Get the percentage of network transfer used for each region transfer pool.
 * @param generalPoolUsage
 * @param regions
 * @returns an array of objects containing the percentage of network transfer used and the region name
 */
export const getRegionTransferPools = (
  generalPoolUsage: RegionalNetworkUtilization | undefined,
  regions: Region[] | undefined
) => {
  if (!generalPoolUsage || !regions) {
    return [];
  }

  return generalPoolUsage?.region_transfers.map((pool) => {
    const regionName = regions?.find((r) => r.id === pool.id)?.label ?? '';

    return {
      pct: calculatePoolUsagePct(pool),
      regionName,
    };
  });
};
