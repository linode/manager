import * as React from 'react';
import Notice from 'src/components/Notice';
import useFlags from 'src/hooks/useFlags';

// Ideally we should add premium as a capability so the availability is returned by the API,
// but it's not there yet so we're using a flag for now.
const PremiumPlansAvailabilityNotice = React.memo(() => {
  const { premiumPlansAvailabilityNotice } = useFlags();

  if (premiumPlansAvailabilityNotice) {
    return <Notice warning>{premiumPlansAvailabilityNotice}</Notice>;
  }

  return null;
});

export default PremiumPlansAvailabilityNotice;
