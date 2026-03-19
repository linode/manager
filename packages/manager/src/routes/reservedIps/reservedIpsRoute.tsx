import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsReserveIpEnabled } from 'src/features/ReservedIps/utils';

export const ReservedIpsRoute = () => {
  const { isReserveIpEnabled } = useIsReserveIpEnabled();

  if (!isReserveIpEnabled) {
    return <NotFound />;
  }
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Reserved IPs" />
      <Outlet />
    </React.Suspense>
  );
};
