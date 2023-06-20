import type { LinodeTypeClass, Region } from '@linode/api-v4';

interface PremiumPlanInfoProps {
  regionsData: Region[] | undefined;
  selectedRegionID?: Region['id'];
}

/**
 * @param {Region[]} regionsData
 * @param {string} selectedRegionID
 * @returns {object} { hasSelectedRegion, isPremiumPlanPanelDisabled, isSelectedRegionPremium }
 */
export const usePremiumPlansUtils = (props: PremiumPlanInfoProps) => {
  const { regionsData, selectedRegionID } = props;

  /**
   * If the user has selected a region, find that region in the regionsData
   * @returns {Region | undefined}
   */
  const selectedRegion = regionsData?.find(
    (region: Region) => region.id === selectedRegionID
  );

  /**
   * If the user has selected a region
   * @returns {boolean}
   */
  const hasSelectedRegion = Boolean(selectedRegionID);

  /**
   * If the user has selected a region and that region has Premium Plans
   * @returns {boolean}
   */
  const isSelectedRegionPremium = Boolean(
    selectedRegion?.capabilities.includes('Premium Plans')
  );

  /**
   * A util to determine if the Premium Plan selection should be disabled
   * @returns {boolean}
   */
  const isPremiumPlanPanelDisabled = (planType?: LinodeTypeClass) =>
    hasSelectedRegion && planType === 'premium' && !isSelectedRegionPremium;

  return {
    hasSelectedRegion,
    isPremiumPlanPanelDisabled,
    isSelectedRegionPremium,
  };
};
