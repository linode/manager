import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const CloudPulseRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Cloud Pulse" />
      <Outlet />
    </React.Suspense>
  );
};

const cloudPulseRoute = createRoute({
  component: CloudPulseRoutes,
  getParentRoute: () => rootRoute,
  path: 'monitor/cloudpulse',
});

const cloudPulseLandingRoute = createRoute({
  getParentRoute: () => cloudPulseRoute,
  path: '/',
}).lazy(() =>
  import('src/features/CloudPulse/CloudPulseLanding').then(
    (m) => m.CloudPulseLandingLazyRoute
  )
);

export const cloudPulseRouteTree = cloudPulseRoute.addChildren([
  cloudPulseLandingRoute,
]);
