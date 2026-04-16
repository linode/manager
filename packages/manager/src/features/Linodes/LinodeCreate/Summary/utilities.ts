import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import {
  formatPriceForInterval,
  getLabelForInterval,
  getPriceForInterval,
} from 'src/utilities/pricing/priceInterval';

import type { LinodeType, PriceObject } from '@linode/api-v4';

interface LinodePriceOptions {
  /**
   * The billing interval to display pricing for.
   * Driven by the `computePricing` LD flag. Defaults to `'monthly'`.
   */
  interval?: keyof PriceObject;
  /**
   * The selected region for the Linode
   */
  regionId: string | undefined;
  /**
   * The stackscript_data (user defined fields)
   *
   * This is needed to calculate the Linode price because we could be dealing with
   * a Marketplace app that deploys a cluster (or clusters)
   */
  stackscriptData: Record<string, string> | undefined;
  /**
   * The selected Linode type
   */
  type: LinodeType | undefined;
  /**
   * An array of all Linode types
   */
  types: LinodeType[] | undefined;
}

export const getLinodePrice = (options: LinodePriceOptions) => {
  const {
    interval = 'monthly',
    stackscriptData,
    regionId,
    type,
    types,
  } = options;

  const price = getLinodeRegionPrice(type, regionId);
  const priceValue = getPriceForInterval(price, interval);

  const clusterSize = stackscriptData?.['cluster_size'];
  const isCluster = clusterSize !== undefined;

  if (regionId === undefined || price === undefined || priceValue === null) {
    return undefined;
  }

  if (isCluster) {
    let totalClusterSize = Number(clusterSize);
    let clusterTotal = (priceValue ?? 0) * Number(clusterSize);

    const complexClusterData = getParsedMarketplaceClusterData(
      stackscriptData,
      types
    );

    for (const clusterPool of complexClusterData) {
      const poolPrice = getLinodeRegionPrice(clusterPool.type, regionId);
      const numberOfNodesInPool = parseInt(clusterPool.size ?? '0', 10);
      clusterTotal +=
        (getPriceForInterval(poolPrice, interval) ?? 0) * numberOfNodesInPool;
      totalClusterSize += numberOfNodesInPool;
    }

    const clusterLabel = getLabelForInterval(interval);

    return `${totalClusterSize} Nodes - $${formatPriceForInterval(clusterTotal, interval)}/${clusterLabel}`;
  }

  const label = getLabelForInterval(interval);

  return `$${formatPriceForInterval(priceValue, interval)}/${label}`;
};

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

export function getParsedMarketplaceClusterData(
  stackscriptData: Record<string, string> = {},
  types: LinodeType[] | undefined
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
      cluster.type = types?.find((t) => t.label === value);
    }
  }
  return result;
}
