import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { ObjectStorageSelectionProvider } from 'src/features/ObjectStorage/ObjectStorageContext';

export const ObjectStorageRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ObjectStorageSelectionProvider>
        <ProductInformationBanner bannerLocation="Object Storage" />
        <Outlet />
      </ObjectStorageSelectionProvider>
    </React.Suspense>
  );
};
