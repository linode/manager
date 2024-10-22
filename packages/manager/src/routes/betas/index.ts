import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { BetaRoutes } from './BetasRoute';

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
