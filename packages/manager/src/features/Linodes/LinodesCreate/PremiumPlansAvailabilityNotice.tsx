import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import type { Region } from '@linode/api-v4';
import {
  StyledFormattedRegionList,
  StyledNotice,
  StyledNoticeTypography,
  StyledTextTooltip,
} from './PremiumPlansAvailabilityNotice.styles';

export interface PremiumPlansAvailabilityNoticeProps {
  isSelectedRegionPremium: boolean;
  hasSelectedRegion: boolean;
  regionsData: Region[];
}

export const PremiumPlansAvailabilityNotice = React.memo(
  (props: PremiumPlansAvailabilityNoticeProps) => {
    const { hasSelectedRegion, isSelectedRegionPremium, regionsData } = props;

    const getPremiumRegionList = React.useCallback(() => {
      return (
        regionsData?.filter((region: Region) =>
          region.capabilities.includes('Premium Plans')
        ) || []
      );
    }, [regionsData]);

    return (
      <PremiumPlansAvailabilityNoticeMessage
        hasSelectedRegion={hasSelectedRegion}
        isSelectedRegionPremium={isSelectedRegionPremium}
        premiumRegionList={getPremiumRegionList()}
      />
    );
  }
);

interface PremiumPlansAvailabilityNoticeMessageProps {
  hasSelectedRegion: boolean;
  isSelectedRegionPremium: boolean;
  premiumRegionList: Region[];
}

const PremiumPlansAvailabilityNoticeMessage = (
  props: PremiumPlansAvailabilityNoticeMessageProps
) => {
  const {
    hasSelectedRegion,
    isSelectedRegionPremium,
    premiumRegionList,
  } = props;

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      {premiumRegionList?.map((region: Region) => {
        return (
          <ListItem
            disablePadding
            key={region.id}
          >{`${region.label} (${region.id})`}</ListItem>
        );
      })}
    </StyledFormattedRegionList>
  );

  return hasSelectedRegion && !isSelectedRegionPremium ? (
    <StyledNotice error dataTestId="premium-notice-error">
      <StyledNoticeTypography>
        Premium Plans are not currently available in this region.&nbsp;
        <StyledTextTooltip
          displayText="See Global availability"
          tooltipText={<FormattedRegionList />}
        />
      </StyledNoticeTypography>
    </StyledNotice>
  ) : !hasSelectedRegion ? (
    <StyledNotice warning dataTestId="premium-notice-warning">
      <StyledNoticeTypography>
        Premium Plans are currently available in&nbsp;
        <StyledTextTooltip
          displayText="select regions"
          tooltipText={<FormattedRegionList />}
        />
        .
      </StyledNoticeTypography>
    </StyledNotice>
  ) : null;
};
