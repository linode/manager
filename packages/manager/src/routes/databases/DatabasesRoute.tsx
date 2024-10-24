import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

export const DatabasesRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Databases" />
      <ProductInformationBanner bannerLocation="Databases" />
      <Outlet />
    </React.Suspense>
  );
};
