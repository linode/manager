import { getType } from '@linode/api-v4/lib/linodes/types';

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
  typeData?: any;
  typeId?: string;
}

export const getLinodePrice = (options: LinodePriceOptions) => {
  const { clusterSize, regionId, type, clusterData } = options;
  const price = getLinodeRegionPrice(type, regionId);

  const isCluster = clusterSize !== undefined;

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
    let clusterTotalMonthlyPrice = 0;
    let clusterTotalHourlyPrice = 0;

    // cluster monthly
    clusterData!.forEach((item) => {
      const price = getLinodeRegionPrice(item.typeData, regionId);
      const sizeMultiplier = parseInt(item.size ?? '0', 10);
      clusterTotalMonthlyPrice += (price?.monthly ?? 0) * sizeMultiplier;
    });

    // cluster hourly
    clusterData!.forEach((item) => {
      const price = getLinodeRegionPrice(item.typeData, regionId);
      const sizeMultiplier = parseInt(item.size ?? '0', 10);
      clusterTotalHourlyPrice += (price?.hourly ?? 0) * sizeMultiplier;
    });

    // total cluster size
    clusterData!.forEach((item) => {
      const sizeMultiplier = parseInt(item.size ?? '0', 10);
      totalClusterSize += sizeMultiplier;
    });

    // this instance
    const totalMonthlyPrice = renderMonthlyPriceToCorrectDecimalPlace(
      price.monthly * Number(clusterSize) + clusterTotalMonthlyPrice
    );
    const totalHourlyPrice = renderMonthlyPriceToCorrectDecimalPlace(
      price.hourly * Number(clusterSize) + clusterTotalHourlyPrice
    );

    return `${totalClusterSize} Nodes - $${totalMonthlyPrice}/month $${totalHourlyPrice}/hr`;
  }

  return `$${renderMonthlyPriceToCorrectDecimalPlace(price.monthly)}/month`;
};

export type ClusterDataTypes = {
  prefix: string;
  size?: string;
  typeId?: string;
};

export function parseClusterData(
  stackscriptData: Record<string, any> = {}
): ClusterDataTypes[] {
  const result: ClusterDataTypes[] = [];

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
      cluster.typeId = value as string;
    }
  }
  return result;
}

export const fetchLinodeType = async (typeId: string): Promise<LinodeType> => {
  return await getType(typeId);
};
