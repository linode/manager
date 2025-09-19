import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

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

// export const betaRouteTree = betasRoute.addChildren([
//   betaLandingRoute,
//   betaSignupRoute,
// ]);

export const betaRouteTree = createRoute({
  getParentRoute: () => rootRoute,
  // preload: true,
  path: "betas",
  component: lazyRouteComponent(() => import("betas/app"))
});
