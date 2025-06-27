import { ListItem, Notice } from '@linode/ui';
import { formatPlanTypes, getCapabilityFromPlanType } from '@linode/utilities';
import * as React from 'react';

import {
  PlanNoticeTypography,
  PlanTextTooltip,
  StyledFormattedRegionList,
} from './PlansAvailabilityNotice.styles';

import type { LinodeTypeClass, Region } from '@linode/api-v4';

export interface PlansAvailabilityNoticeProps {
  hasSelectedRegion: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionsData: Region[];
}

export const PlansAvailabilityNotice = React.memo(
  (props: PlansAvailabilityNoticeProps) => {
    const {
      hasSelectedRegion,
      isSelectedRegionEligibleForPlan,
      planType,
      regionsData,
    } = props;
    const capability = getCapabilityFromPlanType(planType);

    const getEligibleRegionList = React.useCallback(() => {
      return (
        regionsData?.filter((region: Region) =>
          region.capabilities.includes(capability)
        ) || []
      );
    }, [capability, regionsData]);

    return (
      <PlansAvailabilityNoticeMessage
        hasSelectedRegion={hasSelectedRegion}
        isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
        planType={planType}
        regionList={getEligibleRegionList()}
      />
    );
  }
);

interface PlansAvailabilityNoticeMessageProps {
  hasSelectedRegion: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionList: Region[];
}

const PlansAvailabilityNoticeMessage = (
  props: PlansAvailabilityNoticeMessageProps
) => {
  const {
    hasSelectedRegion,
    isSelectedRegionEligibleForPlan,
    planType,
    regionList,
  } = props;

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      {regionList?.map((region: Region) => {
        return (
          <ListItem
            disablePadding
            key={region.id}
          >{`${region.label} (${region.id})`}</ListItem>
        );
      })}
    </StyledFormattedRegionList>
  );

  const formattedPlanType = formatPlanTypes(planType);

  if (!hasSelectedRegion) {
    return (
      <Notice dataTestId={`${planType}-notice-warning`} variant="warning">
        <PlanNoticeTypography>
          {formattedPlanType} Plans are currently available in&nbsp;
          <PlanTextTooltip
            displayText="select regions"
            tooltipText={<FormattedRegionList />}
          />
          .
        </PlanNoticeTypography>
      </Notice>
    );
  }

  if (hasSelectedRegion && !isSelectedRegionEligibleForPlan) {
    return (
      <Notice
        bypassValidation={true}
        dataTestId={`${planType}-notice-error`}
        variant="error"
      >
        <PlanNoticeTypography>
          {formattedPlanType} Plans are not currently available in this
          region.&nbsp;
          <PlanTextTooltip
            displayText="See global availability"
            tooltipText={
              regionList.length > 0 ? (
                <FormattedRegionList />
              ) : (
                'There are no regions available for this plan.'
              )
            }
          />
          .
        </PlanNoticeTypography>
      </Notice>
    );
  }

  return null;
};
