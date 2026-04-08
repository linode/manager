import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { QuotasRoute } from './QuotasRoute';

import type { QuotaServiceType } from '@linode/api-v4';

interface QuotasSearchParams {
  service?: QuotaServiceType;
}

const quotasRoute = createRoute({
  component: QuotasRoute,
  getParentRoute: () => rootRoute,
  path: 'quotas',
  validateSearch: (search: QuotasSearchParams) => search,
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
