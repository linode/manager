import { getDCSpecificPrice } from './dynamicPricing';

import type { FlagSet } from 'src/featureFlags';

interface Props {
  flags: FlagSet;
  regionId: string;
  size: number;
}

/**
 * Gets the base price of a volume based on its size.
 *
 * @param size The size of a Volume in GBs
 * @returns the base price of a volume based on its size
 */
export const getDynamicVolumePrice = ({ flags, regionId, size }: Props) => {
  const pricePerSize = size ? (size >= 10 ? size / 10 : 0) : 0;

  return getDCSpecificPrice({
    basePrice: pricePerSize,
    flags,
    regionId,
  });
};
