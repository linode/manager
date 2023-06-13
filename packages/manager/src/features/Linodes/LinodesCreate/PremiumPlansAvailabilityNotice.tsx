import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TextTooltip } from 'src/components/TextTooltip';
import type { Region } from '@linode/api-v4';

interface Props {
  regionsData?: Region[];
  selectedRegionID?: string;
}

type PremiumRegionList = Region[];

export const PremiumPlansAvailabilityNotice = React.memo((props: Props) => {
  const { regionsData, selectedRegionID } = props;
  const selectedRegion: Region | undefined = regionsData?.find(
    (region: Region) => region.id === selectedRegionID
  );
  const hasSelectedRegion: boolean = Boolean(selectedRegionID);
  const isSelectedRegionPremium: boolean = Boolean(
    selectedRegion?.capabilities.includes('Premium')
  );
  const getPremiumRegionList = () => {
    return (
      regionsData?.filter(
        (region: Region) => region.capabilities.includes('Linodes') // TODO: change to 'Premium' when API is updated
      ) || []
    );
  };

  // console.log('premiumRegionList', getPremiumRegionList());

  return !isSelectedRegionPremium ? (
    <PremiumPlansAvailabilityNoticeMessage
      isSelectedRegionPremium={isSelectedRegionPremium}
      hasSelectedRegion={hasSelectedRegion}
      premiumRegionList={getPremiumRegionList()}
    />
  ) : null;
});

interface PremiumPlansAvailabilityNoticeMessageProps {
  isSelectedRegionPremium: boolean;
  hasSelectedRegion: boolean;
  premiumRegionList: PremiumRegionList;
}

const PremiumPlansAvailabilityNoticeMessage = (
  props: PremiumPlansAvailabilityNoticeMessageProps
) => {
  const {
    isSelectedRegionPremium,
    hasSelectedRegion,
    premiumRegionList,
  } = props;

  const FormattedRegionList = () => (
    <ul>
      {premiumRegionList.map((region: Region) => {
        return <li key={region.id}>{`${region.label} (${region.id})`}</li>;
      })}
    </ul>
  );

  return !hasSelectedRegion || isSelectedRegionPremium ? (
    <Notice warning dataTestId="premium-notice">
      <Typography>
        Premium Plans are currently available in select regions:&nbsp;
        <TextTooltip
          displayText="select regions"
          tooltipText={<FormattedRegionList />}
        />
      </Typography>
    </Notice>
  ) : (
    <Notice error dataTestId="premium-notice">
      <Typography>
        Premium Plans are not currently available in this region.&nbsp;
        <TextTooltip
          displayText="See Global availability"
          tooltipText={<FormattedRegionList />}
        />
      </Typography>
    </Notice>
  );
};
