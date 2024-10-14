import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const VPCRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="VPC" />
      <ProductInformationBanner bannerLocation="VPC" />
      <Outlet />
    </React.Suspense>
  );
};

const vpcsRoute = createRoute({
  component: VPCRoutes,
  getParentRoute: () => rootRoute,
  path: 'vpcs',
});

const vpcsLandingRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/VPCs/VPCLanding/VPCLanding').then(
    (m) => m.vpcLandingLazyRoute
  )
);

const vpcsCreateRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/VPCs/VPCCreate/VPCCreate').then(
    (m) => m.vpcCreateLazyRoute
  )
);

const vpcsDetailRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: '$vpcId',
}).lazy(() =>
  import('src/features/VPCs/VPCDetail/VPCDetail').then(
    (m) => m.vpcDetailLazyRoute
  )
);

export const vpcsRouteTree = vpcsRoute.addChildren([
  vpcsLandingRoute,
  vpcsCreateRoute,
  vpcsDetailRoute,
]);
