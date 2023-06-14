import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import type { Region } from '@linode/api-v4';
import {
  StyledFormattedRegionList,
  StyledNoticeTypography,
  StyledTextTooltip,
} from './PremiumPlansAvailabilityNotice.styles';

export interface PremiumPlansAvailabilityNoticeProps {
  isSelectedRegionPremium?: boolean;
  hasSelectedRegion?: boolean;
  regionsData?: Region[];
}

export const PremiumPlansAvailabilityNotice = React.memo(
  (props: PremiumPlansAvailabilityNoticeProps) => {
    const { isSelectedRegionPremium, hasSelectedRegion, regionsData } = props;

    const getPremiumRegionList = React.useCallback(() => {
      return (
        regionsData?.filter(
          (region: Region) =>
            region.capabilities.includes(
              'Linodes'
            ) /**  @TODO: change to 'Premium' when API is updated */
        ) || []
      );
    }, [regionsData]);

    return !isSelectedRegionPremium ? (
      <PremiumPlansAvailabilityNoticeMessage
        hasSelectedRegion={hasSelectedRegion}
        premiumRegionList={getPremiumRegionList()}
      />
    ) : null;
  }
);

interface PremiumPlansAvailabilityNoticeMessageProps {
  hasSelectedRegion?: boolean;
  premiumRegionList?: Region[];
}

const PremiumPlansAvailabilityNoticeMessage = (
  props: PremiumPlansAvailabilityNoticeMessageProps
) => {
  const { hasSelectedRegion, premiumRegionList } = props;

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

  return hasSelectedRegion ? (
    <Notice error dataTestId="premium-notice-error">
      <StyledNoticeTypography>
        Premium Plans are not currently available in this region.&nbsp;
        <StyledTextTooltip
          displayText="See Global availability"
          tooltipText={<FormattedRegionList />}
        />
      </StyledNoticeTypography>
    </Notice>
  ) : (
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
  );
};
