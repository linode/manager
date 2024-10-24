import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

export const ImagesRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Images" />
      <Outlet />
    </React.Suspense>
  );
};
