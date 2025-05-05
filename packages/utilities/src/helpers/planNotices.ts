import type { Capabilities, LinodeTypeClass, Region } from '@linode/api-v4';

interface PremiumPlanInfoProps {
  regionsData: Region[] | undefined;
  selectedRegionID?: Region['id'];
}

/**
 * @param {Region[]} regionsData
 * @param {string} selectedRegionID
 * @returns {object} { hasSelectedRegion, isPlanPanelDisabled, isSelectedRegionEligibleForPlan }
 */
export const plansNoticesUtils = (props: PremiumPlanInfoProps) => {
  const { regionsData, selectedRegionID } = props;

  /**
   * If the user has selected a region, find that region in the regionsData
   * @returns {Region | undefined}
   */
  const selectedRegion = regionsData?.find(
    (region: Region) => region.id === selectedRegionID,
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
  const isSelectedRegionEligibleForPlan = (planType: LinodeTypeClass) =>
    Boolean(
      selectedRegion?.capabilities.includes(
        getCapabilityFromPlanType(planType),
      ),
    );

  /**
   * A util to determine if the Premium Plan selection should be disabled
   * @param {LinodeTypeClass} linodeType
   * @param {Capabilities} planType
   * @returns {boolean}
   */
  const isPlanPanelDisabled = (planType: LinodeTypeClass) =>
    hasSelectedRegion && !isSelectedRegionEligibleForPlan(planType);

  return {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  };
};

/**
 * Maps the plan type to the capability name
 * We only need to map the GPU and Premium plans for our purposes (notices) but this can be expanded
 * @param planType
 * @returns {Capabilities} the capability name
 */
export const getCapabilityFromPlanType = (
  planType: LinodeTypeClass,
): Capabilities => {
  switch (planType) {
    case 'accelerated': {
      return 'NETINT Quadra T1U';
    }
    case 'gpu': {
      return 'GPU Linodes';
    }
    case 'premium': {
      return 'Premium Plans';
    }
    default: {
      return 'Linodes';
    }
  }
};

/**
 * Formats the plan type for display
 * @param planType
 * @returns {string} the formatted plan type
 */
export const formatPlanTypes = (planType: LinodeTypeClass) =>
  planType === 'gpu'
    ? 'GPU'
    : planType.charAt(0).toUpperCase() + planType.slice(1);
