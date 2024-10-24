import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

export const PlacementGroupsRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Placement Groups" />
      <ProductInformationBanner bannerLocation="Placement Groups" />
      <Outlet />
    </React.Suspense>
  );
};
