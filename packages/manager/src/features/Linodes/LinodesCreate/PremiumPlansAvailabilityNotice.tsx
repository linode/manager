import * as React from 'react';
import { Notice } from 'src/components/Notice/Notice';
import useFlags from 'src/hooks/useFlags';

// Ideally we should add premium as a capability so the availability is returned by the API,
// but it's not there yet so we're using a flag for now.
export const PremiumPlansAvailabilityNotice = React.memo(() => {
  const { premiumPlansAvailabilityNotice } = useFlags();

  if (premiumPlansAvailabilityNotice) {
    return (
      <Notice warning dataTestId="premium-notice">
        {premiumPlansAvailabilityNotice}
      </Notice>
    );
  }

  return null;
});
