import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import BetaSignup from 'src/features/Betas/BetaSignup';
import BetasLanding from 'src/features/Betas/BetasLanding';

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
  component: BetasLanding,
  getParentRoute: () => betaRoute,
  path: '/',
});

const betaSignupRoute = createRoute({
  component: BetaSignup,
  getParentRoute: () => betaRoute,
  path: 'signup',
});

export const betaRouteTree = betaRoute.addChildren([
  betaLandingRoute,
  betaSignupRoute,
]);
