import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import type { LinodeType } from '@linode/api-v4';

interface LinodePriceOptions {
  clusterData?: MarketplaceClusterData[] | undefined;
  clusterSize: string | undefined;
  regionId: string | undefined;
  type: LinodeType | undefined;
}

interface MarketplaceClusterData {
  /**
   * The name of the service within the complex Marketplace app cluster.
   *
   * @example mysql
   */
  prefix: string;
  /**
   * The number of nodes just for this paticular service within the Marketplace cluster deployment.
   */
  size?: string;
  /**
   * The Linode type that should be used for nodes in this service
   *
   * @example Linode 2GB
   */
  type?: LinodeType;
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
        const price = getLinodeRegionPrice(clusterPool.type, regionId);
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

export function getParsedMarketplaceClusterData(
  stackscriptData: Record<string, string> = {},
  types: LinodeType[] = []
): MarketplaceClusterData[] {
  const result: MarketplaceClusterData[] = [];

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
      cluster.type = types.find((t) => t.label === value);
    }
  }
  return result;
}
