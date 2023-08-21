import type { LinodeType, PriceObject } from '@linode/api-v4';

const getLinodeRegionPrice = (
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
