import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { QuotasRoute } from './QuotasRoute';

const quotasRoute = createRoute({
  component: QuotasRoute,
  getParentRoute: () => rootRoute,
  path: 'quotas',
});

// Catch all route for quotas page
const quotasCatchAllRoute = createRoute({
  getParentRoute: () => quotasRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/quotas' });
  },
});

// Index route: /quotas (main quotas content)
const quotasIndexRoute = createRoute({
  getParentRoute: () => quotasRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (!context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/account/quotas`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Account/Quotas/quotasLazyRoute').then(
    (m) => m.quotasLazyRoute
  )
);

export const quotasRouteTree = quotasRoute.addChildren([
  quotasIndexRoute,
  quotasCatchAllRoute,
]);
