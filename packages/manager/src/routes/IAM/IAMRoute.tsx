import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

export const IAMRoute = () => {
  const { isIAMEnabled, isLoading } = useIsIAMEnabled();
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Identity and Access" />
      <ProductInformationBanner bannerLocation="Identity and Access" />
      {isLoading ? (
        <SuspenseLoader />
      ) : isIAMEnabled ? (
        <Outlet />
      ) : (
        <NotFound />
      )}
    </React.Suspense>
  );
};
