import type {
  LinodeType,
  PriceObject,
  Region,
  RegionalNetworkUtilization,
} from '@linode/api-v4';
import type { PlanSelectionType } from 'src/features/components/PlansPanel/types';
import type { ExtendedType } from 'src/utilities/extendType';

/**
 * Gets the price of a Linode type for a specific region.
 *
 * @param type The Linode Type
 * @param regionId The region to get the price for
 * @returns pricing information for this specific linode type in a region
 */
export const getLinodeRegionPrice = (
  type?: ExtendedType | LinodeType | PlanSelectionType,
  regionId?: null | string
): PriceObject | undefined => {
  if (!type || !regionId) {
    return undefined;
  }

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
 * Get the price based on provided conditions.
 * @param {string} type - The Linode type.
 * @param {string} selectedRegionId - The selected region ID.
 * @param {boolean | undefined} dcSpecificPricing - The data center specific pricing.
 * @returns {number | undefined} The price or undefined if not available.
 */
export const getPrice = (
  type: ExtendedType | LinodeType | PlanSelectionType | undefined,
  selectedRegionId: string | undefined,
  dcSpecificPricing: boolean | undefined
) => {
  // Check if both dcSpecificPricing and selectedRegionId are available
  if (dcSpecificPricing && selectedRegionId) {
    // If available, return  price of a Linode type
    return getLinodeRegionPrice(type, selectedRegionId);
  } else {
    // If not available, fall back to type.price (may still be undefined)
    return type?.price;
  }
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

  if (currentRegionPrice?.monthly !== selectedRegionPrice?.monthly) {
    return true;
  }

  return false;
};

/**
 * @param regionId the region of the current Linode
 * @param type the type of the current Linode
 * @returns boolean
 */
export const isLinodeInDynamicPricingDC = (
  regionId: Region['id'],
  type: LinodeType | undefined
): boolean => {
  if (!regionId || !type || !type.region_prices) {
    return false;
  }

  const priceIncreaseRegions: Region['id'][] = type.region_prices.map(
    (regionPrice) => regionPrice.id
  );

  return priceIncreaseRegions.includes(regionId) ? true : false;
};

interface DynamicPricingLinodeTransferData {
  dcSpecificPricingFlag: boolean;
  networkTransferData: Partial<RegionalNetworkUtilization> | undefined;
  regionId: Region['id'] | undefined;
}

/**
 * This function is used to determine the network transfer quota and used data for
 * either a given Linode or the global region data.
 * If a the linode is in a dynamic pricing data center, we will use the region specific network transfer data.
 *
 * @param dcSpecificPricingFlag the flag that determines whether or not to apply dynamic pricing
 * @param networkTransferData the network transfer data for the current Linode or the global network transfer data
 * @param regionId the region of the current Linode
 * @returns the quota and used network transfer data for the current Linode or the global network transfer data
 */
export const getDynamicDCNetworkTransferData = ({
  dcSpecificPricingFlag,
  networkTransferData,
  regionId,
}: DynamicPricingLinodeTransferData) => {
  if (!networkTransferData || !regionId) {
    return { quota: 0, used: 0 };
  }

  if (networkTransferData.region_transfers && dcSpecificPricingFlag) {
    const dataCenterSpecificLinodeTransfer = networkTransferData.region_transfers.find(
      (networkTransferDataRegion) => networkTransferDataRegion.id === regionId
    );

    if (dataCenterSpecificLinodeTransfer) {
      return {
        quota: dataCenterSpecificLinodeTransfer.quota || 0,
        used: dataCenterSpecificLinodeTransfer.used || 0,
      };
    }
  }

  return {
    quota: networkTransferData.quota || 0,
    used: networkTransferData.used || 0,
  };
};

/**
 * This function is used to determine if specific pricing exists in a region
 * given any number of Linode Types
 * @param regionId the region to check for specific pricing
 * @param types an array of Linode Types
 * @returns true if there is at least one linode type with a DC specific price for the provided region
 */
export const doesRegionHaveUniquePricing = (
  regionId: Region['id'] | undefined,
  types: LinodeType[] | undefined
) => {
  if (!regionId || !types) {
    return false;
  }

  return types?.some(
    (type) =>
      type.region_prices?.some((regionPrice) => regionPrice.id === regionId) ??
      false
  );
};
