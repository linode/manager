import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsNetworkLoadBalancerEnabled } from 'src/features/NetworkLoadBalancers/utils';

export const NetworkLoadBalancersRoute = () => {
  const { isNetworkLoadBalancerEnabled } = useIsNetworkLoadBalancerEnabled();

  if (!isNetworkLoadBalancerEnabled) {
    return <NotFound />;
  }
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Network LoadBalancers" />
      <Outlet />
    </React.Suspense>
  );
};
