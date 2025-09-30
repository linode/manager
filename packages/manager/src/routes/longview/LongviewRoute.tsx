import { Outlet } from '@tanstack/react-router';
import React from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { storeFactory } from 'src/features/Longview/store';

const store = storeFactory();

export const LongviewRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ReduxStoreProvider store={store}>
        <DocumentTitleSegment segment="Longview" />
        <ProductInformationBanner bannerLocation="Longview" />
        <Outlet />
      </ReduxStoreProvider>
    </React.Suspense>
  );
};
