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
}).lazy(() =>
  import('src/features/Quotas//quotasLandingLazyRoute').then(
    (m) => m.quotasLandingLazyRoute
  )
);

export const quotasRouteTree = quotasRoute.addChildren([
  quotasIndexRoute,
  quotasCatchAllRoute,
]);
