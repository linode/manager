import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const BetaRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Outlet />
    </React.Suspense>
  );
};

const betaRoute = createRoute({
  component: BetaRoutes,
  getParentRoute: () => rootRoute,
  path: 'betas',
});

const betaLandingRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Betas/BetasLanding')
  ),
  getParentRoute: () => betaRoute,
  path: '/',
});

const betaSignupRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Betas/BetaSignup')
  ),
  getParentRoute: () => betaRoute,
  path: 'signup',
});

export const betaRouteTree = betaRoute.addChildren([
  betaLandingRoute,
  betaSignupRoute,
]);
