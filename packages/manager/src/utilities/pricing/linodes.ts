import type { LinodeType, PriceObject } from '@linode/api-v4';

/**
 * Gets the price of a Linode type for a specific region.
 *
 * @param type The Linode Type
 * @param regionId The region to get the price for
 * @returns pricing information for this specific linode type in a region
 */
export const getLinodeRegionPrice = (
  type: LinodeType,
  regionId: string
): PriceObject => {
  const regionSpecificPrice = type.region_prices?.find(
    (regionPrice) => regionPrice.id === regionId
  );

  if (regionSpecificPrice) {
    return {
      hourly: regionSpecificPrice.hourly,
      monthly: regionSpecificPrice.monthly,
    };
  }

  return type.price;
};

/**
 * Given a Linode Type, this function tells you if the Linode type's price
 * is different between two regions.
 *
 * @param type a Linode Type
 * @param fromRegionId the region to compare
 * @param toRegionId the other region to compare to
 * @returns whether or not the Linode price is different between the two regions
 */
export const isLinodeTypeDifferentPriceInSelectedRegion = (
  type: LinodeType | undefined,
  fromRegionId: string | undefined,
  toRegionId: string | undefined
) => {
  if (!type || !fromRegionId || !toRegionId) {
    return false;
  }

  const currentRegionPrice = getLinodeRegionPrice(type, fromRegionId);
  const selectedRegionPrice = getLinodeRegionPrice(type, toRegionId);

  if (currentRegionPrice.monthly !== selectedRegionPrice.monthly) {
    return true;
  }

  return false;
};
