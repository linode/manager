import { createRoute } from '@tanstack/react-router';

import { mainContentRoute } from '../mainContent';
import { BetasRoute } from './BetasRoute';

const betasRoute = createRoute({
  component: BetasRoute,
  getParentRoute: () => mainContentRoute,
  path: 'betas',
});

const betaLandingRoute = createRoute({
  getParentRoute: () => betasRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Betas/betasLandingLazyRoute').then(
    (m) => m.betasLandingLazyRoute
  )
);

const betaSignupRoute = createRoute({
  getParentRoute: () => betasRoute,
  path: 'signup/$betaId',
}).lazy(() =>
  import('src/features/Betas/betaSignupLazyRoute').then(
    (m) => m.betaSignupLazyRoute
  )
);

export const betaRouteTree = betasRoute.addChildren([
  betaLandingRoute,
  betaSignupRoute,
]);
