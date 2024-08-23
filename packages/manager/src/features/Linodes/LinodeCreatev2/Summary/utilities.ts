import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import type { LinodeType } from '@linode/api-v4';

interface LinodePriceOptions {
  clusterSize: string | undefined;
  regionId: string | undefined;
  type: LinodeType | undefined;
}

export const getLinodePrice = (options: LinodePriceOptions) => {
  const { clusterSize, regionId, type } = options;
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
    const numberOfNodes = Number(clusterSize);

    const totalMonthlyPrice = renderMonthlyPriceToCorrectDecimalPlace(
      price.monthly * numberOfNodes
    );

    const totalHourlyPrice = renderMonthlyPriceToCorrectDecimalPlace(
      price.hourly * numberOfNodes
    );

    return `${numberOfNodes} Nodes - $${totalMonthlyPrice}/month $${totalHourlyPrice}/hr`;
  }

  return `$${renderMonthlyPriceToCorrectDecimalPlace(price.monthly)}/month`;
};
