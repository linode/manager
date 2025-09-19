import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { BetaSignup } from './BetaSignup';
import { BetasLanding } from './BetasLanding';

const rootRoute = createRootRoute();

const betasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/betas',
})

const betaLandingRoute = createRoute({
  getParentRoute: () => betasRoute,
  path: '/',
  component: BetasLanding,
})

const betaSignupRoute = createRoute({
  getParentRoute: () => betasRoute,
  path: '/signup/$betaId',
  component: BetaSignup,
})
export const routeTree = rootRoute.addChildren([
  betasRoute.addChildren([
    betaLandingRoute,
    betaSignupRoute,
  ]),
]);

export const router = createRouter({ routeTree, defaultNotFoundComponent: () => <p>Not found!!</p> })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
