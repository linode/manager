import { Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';

export const MarketplaceV2Banner = () => {
  return (
    <DismissibleBanner preferenceKey="marketplacev2-banner" variant="info">
      <Typography>
        <strong>Partner Referrals Beta now available</strong>
      </Typography>
      <Typography>
        The Partner Referrals Beta lets you explore products from Akamai
        qualified partners. Alongside this launch, we&apos;ve renamed{' '}
        <strong>Marketplace</strong> to <strong>Quick Deploy Apps</strong> to
        better reflect its purpose.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/changelog/feb-24-2026-partner-referrals-beta-launch">
          Learn more
        </Link>
      </Typography>
    </DismissibleBanner>
  );
};
