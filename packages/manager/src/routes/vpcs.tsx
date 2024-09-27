import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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
  component: strictLazyRouteComponent(
    () => import('src/features/VPCs/VPCLanding/VPCLanding')
  ),
  getParentRoute: () => vpcsRoute,
  path: '/',
});

const vpcsCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/VPCs/VPCCreate/VPCCreate')
  ),
  getParentRoute: () => vpcsRoute,
  path: 'create',
});

const vpcsDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/VPCs/VPCDetail/VPCDetail')
  ),
  getParentRoute: () => vpcsRoute,
  path: '$vpcId',
});

export const vpcsRouteTree = vpcsRoute.addChildren([
  vpcsLandingRoute,
  vpcsCreateRoute,
  vpcsDetailRoute,
]);
