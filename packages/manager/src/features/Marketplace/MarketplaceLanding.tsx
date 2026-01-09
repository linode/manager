import { BetaChip, Notice } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

export const MarketplaceLanding = () => {
  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: (
                <>
                  Partner Referrals
                  <BetaChip />
                </>
              ),
              position: 1,
            },
            {
              label: 'Catalog',
              position: 2,
            },
          ],
          pathname: '/cloud-marketplace/catalog',
        }}
      />
      <Notice variant="info">Partner Referral Catalog is coming soon...</Notice>
    </>
  );
};
