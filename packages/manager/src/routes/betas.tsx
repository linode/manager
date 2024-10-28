import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { NotFound } from 'src/components/NotFound';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';

import { rootRoute } from './root';

export const BetaRoutes = () => {
  const flags = useFlags();
  const { selfServeBetas } = flags;
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      {selfServeBetas ? <Outlet /> : <NotFound />}
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
  path: 'signup/$betaId',
}).lazy(() =>
  import('src/features/Betas/BetaSignup').then((m) => m.betaSignupLazyRoute)
);

export const betaRouteTree = betaRoute.addChildren([
  betaLandingRoute,
  betaSignupRoute,
]);
