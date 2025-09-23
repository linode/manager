import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { rootRoute } from '../root';

export const betaRouteTree = createRoute({
  getParentRoute: () => rootRoute,
  preload: false,
  path: 'betas/*',
  // @ts-expect-error No types for MF modules currently
  component: lazyRouteComponent(() => import('betas/app')),
});
