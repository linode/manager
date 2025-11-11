import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';

export const NetworkLoadBalancersRoute = () => {
  const flags = useFlags();
  const { networkLoadBalancer } = flags;
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Network LoadBalancers" />
      {networkLoadBalancer ? <Outlet /> : <NotFound />}
    </React.Suspense>
  );
};
