import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { rootRoute } from '../root';

export const betaRouteTree = createRoute({
  getParentRoute: () => rootRoute,
  preload: false,
  path: 'betas/*',
  component: lazyRouteComponent(() => import('betas/app')),
});
