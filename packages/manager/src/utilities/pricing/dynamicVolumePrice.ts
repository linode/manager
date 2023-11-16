import { getDCSpecificPrice } from './dynamicPricing';

interface Options {
  regionId: string;
  size: number;
}

/**
 * Gets the base price of a volume based on its size.
 *
 * @param size The size of a Volume in GBs
 * @returns the base price of a volume based on its size
 */
export const getDynamicVolumePrice = ({ regionId, size }: Options) => {
  const pricePerSize = size ? (size >= 10 ? size / 10 : 0) : 0;

  return getDCSpecificPrice({
    basePrice: pricePerSize,
    regionId,
  });
};
