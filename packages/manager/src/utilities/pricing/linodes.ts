import type { LinodeType, PriceObject, Region } from '@linode/api-v4';

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

interface IsPriceDifferentOptions {
  regionA: Region['id'] | undefined;
  regionB: Region['id'] | undefined;
  type: LinodeType | undefined;
}

/**
 * Given a Linode Type, this function tells you if the Linode type's price
 * is different between two regions.
 *
 * We use this to display a Notice when a user attempts to move Linodes between regions.
 *
 * @returns whether or not the Linode price is different between the two regions
 */
export const isLinodeTypeDifferentPriceInSelectedRegion = ({
  regionA,
  regionB,
  type,
}: IsPriceDifferentOptions) => {
  if (!type || !regionA || !regionB) {
    return false;
  }

  const currentRegionPrice = getLinodeRegionPrice(type, regionA);
  const selectedRegionPrice = getLinodeRegionPrice(type, regionB);

  if (currentRegionPrice.monthly !== selectedRegionPrice.monthly) {
    return true;
  }

  return false;
};
