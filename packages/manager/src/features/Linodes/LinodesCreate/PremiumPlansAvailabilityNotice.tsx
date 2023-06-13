import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TextTooltip } from 'src/components/TextTooltip';
import type { Region } from '@linode/api-v4';

export interface PremiumPlansAvailabilityNoticeProps {
  isSelectedRegionPremium?: boolean;
  hasSelectedRegion?: boolean;
  regionsData?: Region[];
}

export const PremiumPlansAvailabilityNotice = React.memo(
  (props: PremiumPlansAvailabilityNoticeProps) => {
    const { isSelectedRegionPremium, hasSelectedRegion, regionsData } = props;

    const getPremiumRegionList = () => {
      return (
        regionsData?.filter(
          (region: Region) =>
            region.capabilities.includes(
              'Bare Metal'
            ) /**  @TODO: change to 'Premium' when API is updated */
        ) || []
      );
    };

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
    <ul>
      {premiumRegionList?.map((region: Region) => {
        return <li key={region.id}>{`${region.label} (${region.id})`}</li>;
      })}
    </ul>
  );

  return hasSelectedRegion ? (
    <Notice error dataTestId="premium-notice">
      <Typography>
        Premium Plans are not currently available in this region.&nbsp;
        <TextTooltip
          displayText="See Global availability"
          tooltipText={<FormattedRegionList />}
        />
      </Typography>
    </Notice>
  ) : (
    <Notice warning dataTestId="premium-notice">
      <Typography>
        Premium Plans are currently available in select regions:&nbsp;
        <TextTooltip
          displayText="select regions"
          tooltipText={<FormattedRegionList />}
        />
      </Typography>
    </Notice>
  );
};
