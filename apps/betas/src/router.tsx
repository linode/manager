import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { BetaSignup } from './BetaSignup';
import { BetasLanding } from './BetasLanding';

const rootRoute = createRootRoute();

const betaLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/betas',
  component: BetasLanding,
})

const betaSignupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'signup/$betaId',
  component: BetaSignup,
})
export const routeTree = rootRoute.addChildren([
  betaLandingRoute,
  betaSignupRoute,
]);

export const router = createRouter({ routeTree, defaultNotFoundComponent: () => <p>Not found!!</p> })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
