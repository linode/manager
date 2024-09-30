import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

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
  getParentRoute: () => betaRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Betas/BetasLanding').then((m) => m.betasLandingLazyRoute)
);

const betaSignupRoute = createRoute({
  getParentRoute: () => betaRoute,
  path: 'signup',
}).lazy(() =>
  import('src/features/Betas/BetaSignup').then((m) => m.betaSignupLazyRoute)
);

export const betaRouteTree = betaRoute.addChildren([
  betaLandingRoute,
  betaSignupRoute,
]);
