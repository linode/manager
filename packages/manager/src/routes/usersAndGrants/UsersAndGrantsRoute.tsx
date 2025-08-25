import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';

export const UsersAndGrantsRoute = () => {
  const { iamRbacPrimaryNavChanges } = useFlags();
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Account" />
      {iamRbacPrimaryNavChanges ? <Outlet /> : <NotFound />}
    </React.Suspense>
  );
};
