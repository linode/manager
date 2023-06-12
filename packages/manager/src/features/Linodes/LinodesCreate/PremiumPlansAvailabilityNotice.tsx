import * as React from 'react';
import { Notice } from 'src/components/Notice/Notice';
import useFlags from 'src/hooks/useFlags';
import type { Region } from '@linode/api-v4';

interface Props {
  regionsData?: Region[];
  selectedRegionID?: string;
}

// Ideally we should add premium as a capability so the availability is returned by the API,
// but it's not there yet so we're using a flag for now.
export const PremiumPlansAvailabilityNotice = React.memo((props: Props) => {
  const { premiumPlansAvailabilityNotice } = useFlags();
  // const { regionsData, selectedRegionID } = props;
  // const selectedRegion =
  //   regionsData &&
  //   selectedRegionID &&
  //   regionsData.find((region: any) => region.id === selectedRegionID);

  // console.log({ selectedRegion });

  if (premiumPlansAvailabilityNotice) {
    return (
      <Notice warning dataTestId="premium-notice">
        {premiumPlansAvailabilityNotice}
      </Notice>
    );
  }

  return null;
});
