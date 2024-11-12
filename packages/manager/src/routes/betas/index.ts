import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { BetasRoute } from './BetasRoute';

const betasRoute = createRoute({
  component: BetasRoute,
  getParentRoute: () => rootRoute,
  path: 'betas',
});

const betaLandingRoute = createRoute({
  getParentRoute: () => betasRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Betas/BetasLanding').then((m) => m.betasLandingLazyRoute)
);

const betaSignupRoute = createRoute({
  getParentRoute: () => betasRoute,
  path: 'signup/$betaId',
}).lazy(() =>
  import('src/features/Betas/BetaSignup').then((m) => m.betaSignupLazyRoute)
);

export const betaRouteTree = betasRoute.addChildren([
  betaLandingRoute,
  betaSignupRoute,
]);
