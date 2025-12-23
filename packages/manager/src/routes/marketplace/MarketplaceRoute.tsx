import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsMarketplaceEnabled } from 'src/features/Marketplace/utils';

export const MarketplaceRoute = () => {
  const { isMarketplaceFeatureEnabled } = useIsMarketplaceEnabled();

  if (!isMarketplaceFeatureEnabled) {
    return <NotFound />;
  }
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Marketplace" />
      <ProductInformationBanner bannerLocation="Marketplace" />
      <Outlet />
    </React.Suspense>
  );
};
