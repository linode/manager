import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/features/IAM/Shared/SuspenseLoader/SuspenseLoader';

export const IAMRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Identity and Access" />
      <ProductInformationBanner bannerLocation="Identity and Access" />
      <Outlet />
    </React.Suspense>
  );
};
