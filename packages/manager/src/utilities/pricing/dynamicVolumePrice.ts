import { VolumeType } from '@linode/api-v4';

import { getDCSpecificPriceByType } from './dynamicPricing';

interface Options {
  regionId: string;
  size: number;
  type: VolumeType | undefined;
}

/**
 * Gets the base price of a volume based on its size.
 *
 * @param size The size of a Volume in GBs
 * @returns the base price of a volume based on its size
 */
export const getDynamicVolumePrice = ({ regionId, size, type }: Options) => {
  return getDCSpecificPriceByType({
    regionId,
    size,
    type,
  });
};
