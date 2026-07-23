import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsNATGatewaysEnabled } from 'src/features/NATGateways/utils';

export const NATGatewaysRoute = () => {
  const { isNATGatewaysEnabled } = useIsNATGatewaysEnabled();

  if (!isNATGatewaysEnabled) {
    return <NotFound />;
  }
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="NAT Gateways" />
      <Outlet />
    </React.Suspense>
  );
};
