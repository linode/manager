import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import { getCapabilityFromPlanType } from 'src/hooks/usePlansNotices';
import { Notice } from 'src/components/Notice/Notice';
import type { LinodeTypeClass, Region } from '@linode/api-v4';
import {
  StyledFormattedRegionList,
  StyledNoticeTypography,
  StyledTextTooltip,
} from './PlansAvailabilityNotice.styles';

export interface PlansAvailabilityNoticeProps {
  isSelectedRegionEligible: boolean;
  hasSelectedRegion: boolean;
  regionsData: Region[];
  planType: LinodeTypeClass;
}

export const PlansAvailabilityNotice = React.memo(
  (props: PlansAvailabilityNoticeProps) => {
    const {
      hasSelectedRegion,
      isSelectedRegionEligible,
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
        isSelectedRegionEligible={isSelectedRegionEligible}
        regionList={getEligibleRegionList()}
      />
    );
  }
);

interface PlansAvailabilityNoticeMessageProps {
  hasSelectedRegion: boolean;
  isSelectedRegionEligible: boolean;
  regionList: Region[];
}

const PlansAvailabilityNoticeMessage = (
  props: PlansAvailabilityNoticeMessageProps
) => {
  const { hasSelectedRegion, isSelectedRegionEligible, regionList } = props;

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

  return hasSelectedRegion && !isSelectedRegionEligible ? (
    <Notice error dataTestId="premium-notice-error">
      <StyledNoticeTypography>
        Premium Plans are not currently available in this region.&nbsp;
        <StyledTextTooltip
          displayText="See global availability"
          tooltipText={<FormattedRegionList />}
        />
        .
      </StyledNoticeTypography>
    </Notice>
  ) : !hasSelectedRegion ? (
    <Notice warning dataTestId="premium-notice-warning">
      <StyledNoticeTypography>
        Premium Plans are currently available in&nbsp;
        <StyledTextTooltip
          displayText="select regions"
          tooltipText={<FormattedRegionList />}
        />
        .
      </StyledNoticeTypography>
    </Notice>
  ) : null;
};
