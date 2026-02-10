import { Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';

export const MarketplaceV2Banner = () => {
  return (
    <DismissibleBanner preferenceKey="marketplacev2-banner" variant="info">
      <Typography>
        <strong>Partner Referrals Beta now available</strong>
      </Typography>
      <Typography>
        The Partner Referrals Beta lets you explore products from Akamai
        qualified partners. Alongside this launch, we&apos;ve renamed
        Marketplace to Quick Deploy Apps to better reflect its purpose.
      </Typography>
    </DismissibleBanner>
  );
};
