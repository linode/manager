import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import type { LinodeType } from '@linode/api-v4';

interface LinodePriceOptions {
  clusterData?: ClusterData[] | undefined;
  clusterSize: string | undefined;
  regionId: string | undefined;
  type: LinodeType | undefined;
}

interface ClusterData {
  prefix: string;
  size?: string;
  typeData?: LinodeType;
  typeLabel?: string;
}

export const getLinodePrice = (options: LinodePriceOptions) => {
  const { clusterSize, regionId, type, clusterData } = options;
  const price = getLinodeRegionPrice(type, regionId);

  const isCluster = clusterSize !== undefined;
  const hasClusterData = clusterData !== undefined;

  if (
    regionId === undefined ||
    price === undefined ||
    price.monthly === null ||
    price.hourly === null
  ) {
    return undefined;
  }

  if (isCluster) {
    let totalClusterSize = Number(clusterSize);
    let clusterTotalMonthlyPrice = price.monthly * Number(clusterSize);
    let clusterTotalHourlyPrice = price.hourly * Number(clusterSize);

    if (hasClusterData) {
      for (const clusterPool of clusterData) {
        const price = getLinodeRegionPrice(clusterPool.typeData, regionId);
        const numberOfNodesInPool = parseInt(clusterPool.size ?? '0', 10);
        clusterTotalMonthlyPrice += (price?.monthly ?? 0) * numberOfNodesInPool;
        clusterTotalHourlyPrice += (price?.hourly ?? 0) * numberOfNodesInPool;
        totalClusterSize += numberOfNodesInPool;
      }
    }

    return `${totalClusterSize} Nodes - $${renderMonthlyPriceToCorrectDecimalPlace(clusterTotalMonthlyPrice)}/month $${renderMonthlyPriceToCorrectDecimalPlace(clusterTotalHourlyPrice)}/hr`;
  }

  return `$${renderMonthlyPriceToCorrectDecimalPlace(price.monthly)}/month`;
};

export function parseClusterData(
  stackscriptData: Record<string, string> = {}
): ClusterData[] {
  const result: ClusterData[] = [];

  for (const [key, value] of Object.entries(stackscriptData)) {
    const match = key.match(/^(.+)_cluster_(size|type)$/);
    if (!match) continue;

    const prefix = match[1];
    const kind = match[2];

    let cluster = result.find((c) => c.prefix === prefix);
    if (!cluster) {
      cluster = { prefix };
      result.push(cluster);
    }

    if (kind === 'size') {
      cluster.size = value as string;
    } else if (kind === 'type') {
      cluster.typeLabel = value as string;
    }
  }
  return result;
}
