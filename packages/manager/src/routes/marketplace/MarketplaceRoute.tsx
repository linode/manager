import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsMarketplaceV2Enabled } from 'src/features/Marketplace/utils';

export const MarketplaceRoute = () => {
  const { isMarketplaceV2FeatureEnabled } = useIsMarketplaceV2Enabled();

  if (!isMarketplaceV2FeatureEnabled) {
    return <NotFound />;
  }
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Partner Referrals" />
      <ProductInformationBanner bannerLocation="Marketplace" />
      <Outlet />
    </React.Suspense>
  );
};
