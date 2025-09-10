import { createRoute, redirect } from '@tanstack/react-router';

import { mainContentRoute } from '../mainContent';
import { QuotasRoute } from './QuotasRoute';

const quotasRoute = createRoute({
  component: QuotasRoute,
  getParentRoute: () => mainContentRoute,
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
  import('src/features/Quotas//quotasLandingLazyRoute').then(
    (m) => m.quotasLandingLazyRoute
  )
);

export const quotasRouteTree = quotasRoute.addChildren([
  quotasIndexRoute,
  quotasCatchAllRoute,
]);
