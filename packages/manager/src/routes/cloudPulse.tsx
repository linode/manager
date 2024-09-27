import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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
  component: strictLazyRouteComponent(
    () => import('src/features/CloudPulse/CloudPulseLanding'),
    'CloudPulseLanding'
  ),
  getParentRoute: () => cloudPulseRoute,
  path: '/',
});

export const cloudPulseRouteTree = cloudPulseRoute.addChildren([
  cloudPulseLandingRoute,
]);
